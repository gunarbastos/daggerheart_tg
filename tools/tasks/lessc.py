# import subprocess, sys
# from pathlib import Path
#
# def compile_less():
#     project_dir = Path(__file__).resolve().parent.parent.parent
#     lessc = project_dir / "node_modules" / ".bin" / "lessc.cmd"
#     input_less = project_dir / "dtg" / "less" / "main.less"
#     output_css = project_dir / "dtg" / "main.css"
#
#     if not lessc.exists():
#         print(f"lessc.cmd not found at: {lessc}")
#         return
#
#     command = [str(lessc), str(input_less), str(output_css)]
#     print(f"Running LESS compiler: {' '.join(command)}")
#
#     try:
#         subprocess.run(command, check=True)
#         print("Compilation successful.")
#     except subprocess.CalledProcessError as e:
#         print(f"LESS compilation failed: {e}")
#         sys.exit(1)

import sys
import subprocess
from pathlib import Path
from datetime import datetime

def _less_relpath(path: Path, base: Path) -> str:
    return path.relative_to(base).as_posix()

# def _build_main_less_content(less_dir: Path) -> str:
#     # Collect every .less file except main.less, sort alphabetically (case-insensitive).
#     files = sorted(
#         (p for p in less_dir.rglob("*.less") if p.name != "main.less"),
#         key=lambda p: _less_relpath(p, less_dir).lower()
#     )
#     imports = "\n".join(f'@import "{_less_relpath(p, less_dir)}";' for p in files)
#     # Two header comment lines, then imports
#     now = datetime.now().astimezone()
#     offset = now.utcoffset()
#     offset_hours = (offset.total_seconds() / 3600) if offset else 0
#     header = (
#         "// File generated automatically.\n"
#         "// Last Updated: "
#         + now.strftime(f"%d/%m/%Y %H:%M:%S.{now.microsecond // 1000:03d} UTC{offset_hours:+.0f}")
#         + "\n\n"
#     )
#     return header + imports + ("\n" if imports else "")

def _build_main_less_content(less_dir: Path) -> str:
    # Collect every .less file except main.less
    all_files = [
        p for p in less_dir.rglob("*.less") if p.name != "main.less"
    ]

    # Partition into common/ and others
    common_files = []
    other_files = []
    for p in all_files:
        rel = _less_relpath(p, less_dir)
        if rel.startswith("common/"):
            common_files.append(p)
        else:
            other_files.append(p)

    # Sort each group alphabetically
    common_files = sorted(common_files, key=lambda p: _less_relpath(p, less_dir).lower())
    other_files = sorted(other_files, key=lambda p: _less_relpath(p, less_dir).lower())

    # Combine (common first, then others)
    ordered = common_files + other_files

    # Build header + imports
    now = datetime.now().astimezone()
    offset = now.utcoffset()
    offset_hours = (offset.total_seconds() / 3600) if offset else 0
    header = (
        "// File generated automatically.\n"
        "// Last Updated: "
        + now.strftime(f"%d/%m/%Y %H:%M:%S.{now.microsecond // 1000:03d} UTC{offset_hours:+.0f}")
        + "\n\n"
    )
    imports = "\n".join(f'@import "{_less_relpath(p, less_dir)}";' for p in ordered)
    return header + imports + ("\n" if imports else "")


def _write_if_body_changed(target: Path, new_content: str) -> bool:
    """
    First run: always overwrite if file exists with different body OR if not present.
    Later runs: only rewrite if body (everything after first two lines) changed.
    Returns True if file was written/updated.
    """
    created = not target.exists()
    if not created:
        try:
            existing = target.read_text(encoding="utf-8").splitlines()
            new = new_content.splitlines()
            # Ignore first 3 header lines
            existing_body = "\n".join(existing[3:])
            new_body = "\n".join(new[3:])
            if existing_body == new_body:
                return False
        except Exception:
            # If reading fails, fall through and write
            pass
    target.write_text(new_content, encoding="utf-8")
    return True

def compile_less():
    project_dir = Path(__file__).resolve().parent.parent.parent
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