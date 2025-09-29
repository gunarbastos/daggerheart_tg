from tools import common

def validate_system():
    print("Running basic system validation...")
    print(common.project_root())
    print(common.normalize_version('1.0.2'))
    print(common.normalize_version('v1.0.2'))
    print(common.normalize_version((common.project_root() / "VERSION").as_posix()))
    # try:
    #     common.run(["python", "-m", "tools", "types"], check=True)
    #     common.run(["python", "-m", "tools", "indexes"], check=True)
    #     print("Validation passed.")
    # except Exception as e:
    #     common.fail("Validation failed.")
    #     raise e
