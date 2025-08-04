import os
from pathlib import Path

TARGET_DIRS = [
    "module/common",
    "module/dataModel/actor",
    "module/dataModel/item",
    "module/document/actor",
    "module/document/item",
    "module/sheet/actor",
    "module/sheet/item"
]

def generate_indexes_internal(directory: Path):
    exports = []
    for file in directory.glob("*.js"):
        if file.name == "index.js":
            continue
        base_name = file.stem
        exports.append(f"export * from './{base_name}.js';")
    index_file = directory / "index.js"
    index_file.write_text("\n".join(exports) + "\n", encoding="utf-8")
    print(f"✅ Generated index.js in {directory}")
    os.system(f"git add {index_file}")

def generate_indexes():
    root = Path(__file__).resolve().parent.parent / "dtg"
    for rel_path in TARGET_DIRS:
        full_path = root / rel_path
        if full_path.exists():
            generate_indexes_internal(full_path)