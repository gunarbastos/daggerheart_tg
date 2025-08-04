import subprocess
import sys
from pathlib import Path
from .common import project_root

def run_release(version: str, use_github_actions: bool = False):
    print(f"🚀 Releasing version {version}")
    subprocess.run(["python", "-m", "tools", "build", "--release", version], check=True)

    if use_github_actions:
        print("🔁 Pushing to origin to trigger GitHub Actions...")
        subprocess.run(["git", "commit", "-am", f"release: {version}"], check=True)
        subprocess.run(["git", "push"], check=True)
        subprocess.run(["git", "tag", version], check=True)
        subprocess.run(["git", "push", "origin", version], check=True)
    else:
        print("🔧 Local release complete. Manually push tag to GitHub if needed.")
