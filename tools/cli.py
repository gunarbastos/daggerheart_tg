import argparse


def main():
    parser = argparse.ArgumentParser(prog="tools", description="DTG Tooling CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    idx = sub.add_parser("indexes", help="Generate index.js files. If not extra parameters are given, regenerates for all modules folders. If both are given file has precedence over dir")
    idx.add_argument("--file", help="Filename of the changed file, index.js of that folder will be generated", required=False)
    idx.add_argument("--dir", help="Directory to generate index.js for", required=False)
    sub.add_parser("less", help="Compile LESS to CSS")
    #sub.add_parser("deploy", help="Copy to local Foundry system folder")
    sub.add_parser("validate", help="Validate system before release")
    rel = sub.add_parser("release", help="Release a version")
    rel.add_argument("version", help="Version tag")
    build = sub.add_parser("build", help="Build release package")
    build.add_argument("release", help="Release tag")
    changelog = sub.add_parser("changelog", help="Build release notes into CHANGELOG.md")
    changelog.add_argument("release", help="Release tag")

    args = parser.parse_args()

    if args.cmd == "indexes":
        from tools.tasks.indexes import generate_indexes
        generate_indexes(args.file, args.dir)
    elif args.cmd == "less":
        from tools.tasks.lessc import compile_less
        compile_less()
    #elif args.cmd == "deploy":
    #    from tasks.local_deploy import deploy_to_local_foundry
    #    deploy_to_local_foundry()
    elif args.cmd == "validate":
        from tools.tasks.validate import validate_system
        validate_system()
    elif args.cmd == "release":
        from tools.tasks.release import run_release
        run_release(args.version)
    elif args.cmd == "build":
        from tools.tasks.build import build_release
        build_release(args.release)
    elif args.cmd == "changelog":
        from tools.tasks.changelog import changelog
        changelog(args.release)