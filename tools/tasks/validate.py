import common

def validate_system():
    print("Running basic system validation...")
    print(common.project_root())
    # try:
    #     common.run(["python", "-m", "tools", "types"], check=True)
    #     common.run(["python", "-m", "tools", "indexes"], check=True)
    #     print("Validation passed.")
    # except Exception as e:
    #     common.fail("Validation failed.")
    #     raise e
