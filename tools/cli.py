import argparse

def main():
    parser = argparse.ArgumentParser(description="DTG Tooling CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("indexes", help="Generate index.js files")
    sub.add_parser("types", help="Generate JSDoc type file")
    sub.add_parser("less", help="Compile LESS to CSS")
    sub.add_parser("deploy", help="Copy to local Foundry system folder")
    sub.add_parser("validate", help="Validate system before release")
    rel = sub.add_parser("release", help="Release a version")
    rel.add_argument("version", help="Version tag")
    rel.add_argument("--gh", action="store_true", help="Trigger GitHub Actions")
    build = sub.add_parser("build", help="Build release package")
    build.add_argument("--release", help="Release tag", required=False)

    args = parser.parse_args()

    if args.cmd == "indexes":
        from tasks.indexes import generate_indexes
        generate_indexes()
    elif args.cmd == "types":
        from tasks.types import generate_types
        generate_types()
    elif args.cmd == "less":
        from tasks.lessc import compile_less
        compile_less()
    elif args.cmd == "deploy":
        from tasks.local_deploy import deploy_to_local_foundry
        deploy_to_local_foundry()
    elif args.cmd == "validate":
        from tasks.validate import validate_system
        validate_system()
    elif args.cmd == "release":
        from tasks.release import run_release
        run_release(args.version, use_github_actions=args.gh)
    elif args.cmd == "build":
        from tasks.build import build_release
        build_release(args.release)
