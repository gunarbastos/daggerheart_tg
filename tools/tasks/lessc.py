import subprocess, sys
from pathlib import Path

def compile_less():
    project_dir = Path(__file__).resolve().parent.parent.parent
    lessc = project_dir / "node_modules" / ".bin" / "lessc.cmd"
    input_less = project_dir / "dtg" / "less" / "main.less"
    output_css = project_dir / "dtg" / "main.css"

    if not lessc.exists():
        print(f"lessc.cmd not found at: {lessc}")
        return

    command = [str(lessc), str(input_less), str(output_css)]
    print(f"Running LESS compiler: {' '.join(command)}")

    try:
        subprocess.run(command, check=True)
        print("Compilation successful.")
    except subprocess.CalledProcessError as e:
        print(f"LESS compilation failed: {e}")
        sys.exit(1)