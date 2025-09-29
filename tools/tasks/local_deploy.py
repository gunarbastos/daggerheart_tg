import shutil
from tools import common
from pathlib import Path

def deploy_to_local_foundry():
    source = common.project_root() / "dtg"
    target = Path.home() / "AppData" / "Local" / "FoundryVTT" / "Data" / "systems" / "daggerheart_tg"

    if not target.exists():
        common.fail(f"Foundry target path not found: {target}")
        return

    print(f"Copying files from {source} to {target}")
    for item in source.glob("**/*"):
        rel_path = item.relative_to(source)
        dest_path = target / rel_path
        if item.is_dir():
            dest_path.mkdir(parents=True, exist_ok=True)
        else:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dest_path)
    print("Local Foundry system updated.")
