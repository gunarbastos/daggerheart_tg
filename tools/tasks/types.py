import time
import os
from pathlib import Path
from typing import List
import re

WATCH_DIRS = [
    "module/dataModel/actor",
    "module/dataModel/item",
    "module/common"
]

OUTPUT_FILE = "module/types/system-types.js"

def extract_jsdoc(file_path: Path, typedef_name: str) -> str:
    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    typedef_lines = [f"/**", f" * @typedef {{Object}} {typedef_name}"]

    pattern = re.compile(r"""(?:/\*\*(.*?)\*/)?\s*this\.(\w+)\s*=\s*this\.field\((.*?)\)""", re.DOTALL)
    for match in pattern.findall(content):
        raw_comment, field_name, field_type = match
        field_type = field_type.strip().split(",")[0].strip()
        jsdoc_type = "any"
        if "StringField" in field_type:
            jsdoc_type = "string"
        elif "BooleanField" in field_type:
            jsdoc_type = "boolean"
        elif "NumberField" in field_type:
            jsdoc_type = "number"
        elif "ArrayField" in field_type:
            jsdoc_type = "any[]"
        elif "SetField" in field_type:
            jsdoc_type = "Set<any>"
        elif "ObjectField" in field_type:
            jsdoc_type = "Object"
        elif "ForeignDocumentField" in field_type:
            jsdoc_type = "string"

        comment = raw_comment.strip().replace("*", "").strip() if raw_comment else ""
        typedef_lines.append(f" * @property {{{jsdoc_type}}} {field_name} {comment}")
    typedef_lines.append(" */\n")
    return "\n".join(typedef_lines) if len(typedef_lines) > 3 else None

def scan_files() -> List[str]:
    typedefs = []
    for folder in WATCH_DIRS:
        for file in Path(folder).glob("*.js"):
            typedef_name = file.stem.replace("DataModel", "") + "Data"
            typedef = extract_jsdoc(file, typedef_name)
            if typedef:
                typedefs.append(typedef)

    typedefs.append("""/**
 * @typedef {Object} ClassData
 * @property {string} subclassUuid
 * @property {string[]} featureUuids
 * @property {number} mastery
 * @property {string} description
 *
 * @property {import("foundry.js").Item} subclass - The resolved subclass document
 * @property {import("foundry.js").Item[]} features - The resolved feature documents
 */

/**
 * @typedef {Object} SubclassData
 * @property {string[]} featureUuids
 * @property {number} mastery
 * @property {string} description
 *
 * @property {import("foundry.js").Item[]} features - The resolved feature documents
 */""")
    return typedefs

def write_output(content: List[str]):
    Path(OUTPUT_FILE).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("// AUTO-GENERATED JSDOC TYPEDEFS\n\n")
        f.write("\n".join(content))
    os.system(f"git add {OUTPUT_FILE}")

def get_mtimes():
    return {str(p): p.stat().st_mtime for folder in WATCH_DIRS for p in Path(folder).glob("*.js")}

def main():
    last_mtimes = get_mtimes()
    while True:
        time.sleep(1)
        new_mtimes = get_mtimes()
        if new_mtimes != last_mtimes:
            print("🔄 Detected change in DataModel files. Regenerating types...")
            content = scan_files()
            write_output(content)
            print("✅ Updated system-types.js and staged it.")
            last_mtimes = new_mtimes

if __name__ == "__main__":
    main()
