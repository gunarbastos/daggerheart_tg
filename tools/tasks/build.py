import json, zipfile, common

def build_release(tag=None):
    project_root = common.project_root()
    if tag:
        version = common.normalize_version(tag)
        version_for_paths = f"v{common.normalize_version(tag)}"
    else:
        version = "dev"
        version_for_paths = "dev"

    zip_name = f"dtg-{version_for_paths}.zip"

    repo = common.parse_owner_repo_from_origin()
    rel_dir = project_root / "releases" / version
    rel_dir.mkdir(parents=True, exist_ok=True)

    system_path = project_root / "dtg"
    sys_json_path = system_path / "system.json"
    with open(sys_json_path, "r", encoding="utf-8") as f:
        system_json = json.load(f)

    if tag:
        system_json["version"] = version
        system_json["url"] = f"https://github.com/{repo}"
        system_json["readme"] = f"https://raw.githubusercontent.com/{repo}/stable/README.md"
        system_json["changelog"] = f"https://raw.githubusercontent.com/{repo}/stable/CHANGELOG.md"
        system_json["license"] = f"https://raw.githubusercontent.com/{repo}/stable/LICENSE"
        system_json["manifest"] = f"https://github.com/{repo}/releases/latest/download/system.json"
        system_json["download"] = f"https://github.com/{repo}/releases/download/{version_for_paths}/{zip_name}.zip"

    new_json_path = rel_dir / "system.json"
    with open(sys_json_path, "w", encoding="utf-8") as f:
        json.dump(system_json, f, indent=2, ensure_ascii=False)
    with open(new_json_path, "w", encoding="utf-8") as f:
        json.dump(system_json, f, indent=2, ensure_ascii=False)

    zip_path = rel_dir / zip_name
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for f in system_path.rglob("*"):
            if f.is_file():
                z.write(f, f.relative_to(project_root))
    print(f"Built: {version} @ {rel_dir}")
