import shutil
import json
import zipfile
from pathlib import Path
from .common import project_root

def build_release(tag=None):
    version = tag or "dev"
    repo = "your-user/your-repo"  # Replace this with your GitHub repo
    rel_dir = project_root() / "releases" / version
    rel_dir.mkdir(parents=True, exist_ok=True)

    system_path = project_root() / "dtg"
    sys_json_path = system_path / "system.json"
    with open(sys_json_path, "r", encoding="utf-8") as f:
        system_json = json.load(f)

    if tag:
        system_json["version"] = tag.lstrip("v")
        system_json["url"] = f"https://github.com/{repo}"
        system_json["manifest"] = f"https://raw.githubusercontent.com/{repo}/stable/system.json"
        system_json["download"] = f"https://github.com/{repo}/releases/download/{tag}/system-{tag}.zip"

    new_json_path = rel_dir / "system.json"
    with open(new_json_path, "w", encoding="utf-8") as f:
        json.dump(system_json, f, indent=2)

    zip_name = f"system-{version}.zip"
    zip_path = rel_dir / zip_name
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for f in system_path.rglob("*"):
            if f.is_file():
                z.write(f, f.relative_to(system_path))
    print(f"✅ Built: {zip_path}")
