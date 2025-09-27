import os, sys, common
from pathlib import Path
from datetime import datetime

export_regexes = [
    common.regex.EXPORT_DECL,
    common.regex.EXPORT_LIST
]

def _generate_indexes_internal(directory: Path):
    if not directory.exists():
        print("Directory " + directory.__str__() + " does not exist")
        sys.exit(1)

    print("Generating index.js file for directory " + directory.__str__())
    exports = []
    file_list = [f for f in directory.iterdir() if f.suffix in [".js", ".mjs"]]
    for file in file_list:
        if file.name == "index.js":
            continue
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        base_name = file.stem
        file_exports = []
        for regex in export_regexes:
            for match in regex.finditer(content):
                raw_names = match.group(1).split(',')
                for name in raw_names:
                    #parts = re.split(r"\s+as\s+", name.strip())
                    parts = common.regex.EXPORT_AS.split(name.strip())
                    export_name = parts[1] if len(parts) > 1 else parts[0]
                    file_exports.append(export_name)
        joined_file_exports = ", ".join(file_exports)
        exports.append(f"export {{{joined_file_exports}}} from './{base_name}.js';")
    now = datetime.now().astimezone()
    offset = now.utcoffset()
    offset_hours = offset.total_seconds() / 3600
    index_file = directory / "index.js"
    created_file = not index_file.exists()

    header = (
            "// File generated automatically.\n"
            "// Last Updated: " + now.strftime(
        f"%d/%m/%Y %H:%M:%S.{now.microsecond // 1000:03d} UTC{offset_hours:+.0f}") + "\n\n"
    )
    body = "console.log(`Loaded: ${import.meta.url}`);\n\n" + "\n".join(exports) + "\n"
    new_content = header + body
    if not created_file:
        existing = index_file.read_text(encoding="utf-8")
        # Normalize to line lists and drop the first two lines for comparison
        existing_lines = existing.splitlines()
        new_lines = new_content.splitlines()
        existing_body = "\n".join(existing_lines[2:])  # ignore first 2 comment lines
        new_body = "\n".join(new_lines[2:])  # ignore first 2 comment lines
        if existing_body == new_body:
            sys.exit(0)
    if created_file:
        print(f"adding {index_file} to git")
        os.system(f"git add {index_file}")
    sys.exit(0)

def generate_indexes(file: Path, dira: Path):
    if not(file is None):
        _generate_indexes_internal(Path(file).resolve().parent)
    elif not(dira is None):
        _generate_indexes_internal(Path(dira))
    else:
        root = common.project_root() / "dtg" / "module"
        for dir_path, dir_names, file_names in os.walk(root):
            _generate_indexes_internal(Path(dir_path).resolve())