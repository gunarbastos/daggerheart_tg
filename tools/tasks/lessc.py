import sys, subprocess, common
from pathlib import Path

def _build_main_less_content(less_dir: Path) -> str:
    # Collect every .less file except main.less
    all_files = [
        p for p in less_dir.rglob("*.less") if p.name != "main.less"
    ]

    # Partition into common/ and others
    common_files = []
    other_files = []
    for p in all_files:
        rel = p.relative_to(less_dir).as_posix()
        if rel.startswith("common/"):
            common_files.append(p)
        else:
            other_files.append(p)

    # Sort each group alphabetically
    common_files = sorted(common_files, key=lambda p: p.relative_to(less_dir).as_posix().lower())
    other_files = sorted(other_files, key=lambda p: p.relative_to(less_dir).as_posix().lower())

    # Combine (common first, then others)
    ordered = common_files + other_files

    # Build header + imports
    now = common.now_tmz()
    offset = now.utcoffset()
    offset_hours = (offset.total_seconds() / 3600) if offset else 0
    header = (
        "// File generated automatically.\n"
        "// Last Updated: "
        + now.strftime(f"%d/%m/%Y %H:%M:%S.{now.microsecond // 1000:03d} UTC{offset_hours:+.0f}")
        + "\n\n"
    )
    imports = "\n".join(f'@import "{p.relative_to(less_dir).as_posix()}";' for p in ordered)
    return header + imports + ("\n" if imports else "")


def _write_if_body_changed(target: Path, new_content: str) -> bool:
    """
    First run: always overwrite if file exists with different body OR if not present.
    Later runs: only rewrite if body (everything after first two lines) changed.
    Returns True if file was written/updated.
    """
    created = not target.exists()
    if not created:
        existing = target.read_text(encoding="utf-8").splitlines()
        new = new_content.splitlines()
        # Ignore first 3 header lines
        existing_body = "\n".join(existing[3:])
        new_body = "\n".join(new[3:])
        if existing_body == new_body:
            return False
    target.write_text(new_content, encoding="utf-8")
    return True

def compile_less():
    project_dir = common.project_root()
    lessc = project_dir / "node_modules" / ".bin" / "lessc.cmd"
    less_dir = project_dir / "dtg" / "less"
    main_less = less_dir / "main.less"
    output_css = project_dir / "dtg" / "main.css"

    if not lessc.exists():
        print(f"lessc.cmd not found at: {lessc}")
        return
    if not less_dir.exists():
        print(f"LESS source dir not found: {less_dir}")
        sys.exit(1)

    # 1) Generate desired main.less content (alphabetical, no order preservation)
    new_main = _build_main_less_content(less_dir)

    # 2) Write only if body changed (ignoring first two header lines)
    changed = _write_if_body_changed(main_less, new_main)
    if changed:
        print(f"Updated {main_less}")

    # 3) Compile to CSS
    cmd = [str(lessc), str(main_less), str(output_css)]
    print(f"Running LESS compiler: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
        print("Compilation successful.")
    except subprocess.CalledProcessError as e:
        print(f"LESS compilation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    compile_less()