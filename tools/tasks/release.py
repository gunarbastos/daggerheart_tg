import json, tempfile, os, shutil, common
from pathlib import Path

def _extract_notes_from_changelog(version: str, changelog_path: Path) -> str:
    """
    Extract the markdown block for a version from a Keep a Changelog file.

    Accepts headings like:
      ## [0.1.2] - 2025-09-26
      ## [v0.1.2] - 2025-09-26
    and returns everything up to the next '## ' heading (or EOF).
    """
    if not changelog_path.is_file():
        common.fail(f'Error: CHANGELOG not found at "{changelog_path}".')

    text = changelog_path.read_text(encoding="utf-8")

    # Heading for this version (with optional 'v' inside the brackets, optional date)
    m = common.regex.CHANGELOG_HEADER_FOR(version).search(text)
    if not m:
        common.fail(f'Error: CHANGELOG has no section for version {version}.')
    print(" - version present in CHANGELOG.md")

    start = m.end()

    # Next version heading starts a new section
    n = common.regex.CHANGELOG_NEXT_HEADER.search(text, start)
    end = n.start() if n else len(text)

    notes = text[start:end].strip()
    if not notes:
        common.fail(f'Error: CHANGELOG section for {version} is empty.')
    print(f" - version changes in CHANGELOG.md is not empty")

    return notes

def _verify_version_link_reference(version: str, changelog_path: Path):
    """
    Verify the reference link like:
      [0.1.2]: https://github.com/<owner>/<repo>/releases/tag/v0.1.2
    exists and matches the version. Allows [v0.1.2] label too.
    """
    text = changelog_path.read_text(encoding="utf-8")

    # Find the reference line (case-insensitive on the label's 'v', URL case left as-is)
    m = common.regex.REF_LINE_URL_FOR(version).search(text)
    if not m:
        common.fail(f'Error: CHANGELOG is missing a reference link for version {version} '
             f'(e.g., "[{version}]: https://.../releases/tag/v{version}").')

    url = m.group('url')
    expected_fragment = f"/releases/tag/v{version}"
    if expected_fragment not in url:
        common.fail(f'Error: Version reference URL does not point to "{expected_fragment}".\n'
             f'Found: {url}')
    print(" - version link is present in CHANGELOG.md")


def _precheck(folder, tag_name):
    if shutil.which("gh") is None:
        common.fail("Error: GitHub CLI (gh) is not installed or not on PATH. See https://cli.github.com/")
    print(f" - gh present")

    code, out, err = common.run(["gh", "auth", "status"])
    if code != 0:
        details = err or out or "Unknown authentication error."
        common.fail(f"Error: gh is not authenticated or token is invalid/expired.\nDetails: {details}")
    print(f" - gh authenticated")

    code, out, err = common.run(["gh", "api", "user"])
    if code != 0:
        details = err or out or "Unknown API error."
        common.fail(f"Error: gh token appears invalid/expired when calling API.\nDetails: {details}")
    print(f" - gh can make requests")

    if not os.path.isdir(folder):
        common.fail(f'Error: required folder "{folder}" does not exist.')
    if not os.path.isfile(folder / "system.json"):
        common.fail(f'Error: required file "{folder / "system.json"}" does not exist.')
    if not os.path.isfile(folder / f"dtg-{tag_name}.zip"):
        common.fail(f'Error: required file "{folder / f"dtg-{tag_name}.zip"}" does not exist.')
    print(f" - required files and folders present")

    common.run(["git", "fetch", "--prune", "origin"])
    common.run(["git", "fetch", "--prune", "--tags", "origin"])
    print(f" - updated tags")

    #code, out, err = common.run(["git", "rev-parse", "-q", "--verify", f"refs/tags/{tag_name}"])
    # if code == 0:
    #     details = err or out or "local tag already exists."
    #     common.fail(f"Error: tag for the version already exists in local.\nDetails: {details}")
    # print(f" - no local tag with intended name")

    code, out, err = common.run(["git", "ls-remote", "--exit-code", "--refs", "--tags", "origin", f"refs/tags/{tag_name}"])
    if code == 0:
        details = err or out or "Tag already exists."
        common.fail(f"Error: tag for the version already exists.\nDetails: {details}")
    elif code not in (2, 0):
        common.fail(f"Error: unable to query remote tags.\nDetails: {err or out or 'Unknown'}")
    print(f" - no remote tag with intended name")

def run_release(version: str):
    final_version = common.normalize_version(version)
    project_root = common.project_root()
    version_folder = project_root / "releases" / final_version
    changelog_path = project_root / "CHANGELOG.md"
    print(f"Releasing version v{final_version}")
    print(f"Running prechecks...")
    _verify_version_link_reference(final_version, changelog_path)
    notes = _extract_notes_from_changelog(final_version, changelog_path)
    _precheck(version_folder, f"v{final_version}")
    print(f"Passed prechecks")
    print("")

    print(f"== patch notes =======================")
    print(f"{notes}")
    print(f"======================================")
    try:
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as tf:
            tf.write(notes)
            notes_file = tf.name

        code, out, err = common.run([
            "gh", "pr", "create",
            "--base", "stable",
            "--title", f"v{final_version}",
            "--body",  f"v{final_version}",
            "--json", "number,url"
        ])
        if code != 0:
            common.fail(f"PR creation failed: {err or out}")
        pr = json.loads(out)
        print(f"PR opened: #{pr['number']} {pr['url']}")

        # code, out, err = run(["gh", "pr", "review", str(pr["number"]), "--approve"])
        # if code != 0:
        #     print(f"Warning: PR approval failed (continuing): {err or out}", file=sys.stderr)

        code, out, err = common.run([
            "gh", "pr", "merge", str(pr["number"]),
            "--merge", "--delete-branch", "--admin", "--confirm"
        ])
        if code != 0:
            common.fail(f"PR merge failed: {err or out}")
        print("PR merged successfully.")

        # run(["git", "fetch", "origin", "stable"])
        # run(["git", "tag", "-a", f"v{version}", "origin/stable", "-m", f"v{version}"])
        # run(["git", "push", "origin", f"v{version}"])

        assets = [
            str(version_folder / "system.json"),
            str(version_folder / f"dtg-v{final_version}.zip"),
        ]
        code, out, err = common.run([
            "gh", "release", "create", f"v{final_version}",
            "--target", "stable",
            "--title",  f"v{final_version}",
            "--notes-file", notes_file,
            "--latest",
            *assets
        ])

        if code != 0:
            common.fail(f"Release creation failed: {err or out}")

        code, out, err = common.run([
            "gh", "release", "view", f"v{final_version}",
            "--json", "url,isLatest,assets",
            "--jq", "{url,isLatest,assets:[.assets[].name]}"
        ])
        if code != 0:
            common.fail(f"Release view failed: {err or out}")
        print(out)
    finally:
        try:
            os.remove(notes_file)
        except OSError:
            pass