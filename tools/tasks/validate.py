def validate_system():
    print("🧪 Running basic system validation...")

    try:
        import subprocess
        subprocess.run(["python", "-m", "tools", "types"], check=True)
        subprocess.run(["python", "-m", "tools", "indexes"], check=True)
        print("✅ Validation passed.")
    except Exception as e:
        print("❌ Validation failed.")
        raise e
