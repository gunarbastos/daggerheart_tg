import os, sys, re
from pathlib import Path
from datetime import datetime

export_regexes = [
    re.compile(r"export\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_]+)"),
    re.compile(r"export\s*\{\s*([^}]+)\s*\}")
]

def generate_indexes_internal(directory: Path):
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
                    parts = re.split(r"\s+as\s+", name.strip())
                    export_name = parts[1] if len(parts) > 1 else parts[0]
                    file_exports.append(export_name)
        joined_file_exports = ", ".join(file_exports)
        exports.append(f"export {{{joined_file_exports}}} from './{base_name}.js';")
    now = datetime.now().astimezone()
    offset = now.utcoffset()
    offset_hours = offset.total_seconds() / 3600
    index_file = directory / "index.js"
    created_file = not index_file.exists()
    index_file.write_text("// File generated automatically.\n// Last Updated: " + now.strftime(f"%d/%m/%Y %H:%M:%S.{now.microsecond // 1000:03d} UTC{offset_hours:+.0f}") + "\n\n" + "\n".join(exports) + "\n", encoding="utf-8")
    if created_file:
        print(f"adding {index_file} to git")
        os.system(f"git add {index_file}")

def generate_indexes(file: Path, dira: Path):
    if not(file is None):
        generate_indexes_internal(Path(file).resolve().parent)
    elif not(dira is None):
        generate_indexes_internal(Path(dira))
    else:
        root = Path(__file__).resolve().parent.parent.parent / "dtg" / "module"
        for dirpath, dirnames, filenames in os.walk(root):
            generate_indexes_internal(Path(dirpath).resolve())