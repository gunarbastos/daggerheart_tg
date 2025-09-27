import re
from datetime import date
from pathlib import Path
import shutil
import sys
import common

def _update_changelog_file(changelog_path: Path, version: str, notes_md: str, owner_repo: str | None):
    if not changelog_path.is_file():
        common.fail(f'Error: CHANGELOG not found at "{changelog_path}".')

    text = changelog_path.read_text(encoding="utf-8")
    today = date.today().strftime("%Y-%m-%d")

    # Build full block for this version
    new_block = f"## [{version}] - {today}\n\n{notes_md.strip()}\n\n"

    # Find an existing section for this version (with optional date)
    m = common.regex.CHANGELOG_HEADER_FOR(version).search(text)

    if m:
        # Replace existing section (from its header down to next header or EOF)
        start = m.start()
        next_header = re.search(common.regex.CHANGELOG_NEXT_HEADER, text[m.end():])
        end = m.end() + (next_header.start() if next_header else len(text) - m.end())
        updated = text[:start] + new_block + text[end:]
    else:
        # Insert as newest entry: before the first version header if present; else append
        first_header = re.search(common.regex.CHANGELOG_NEXT_HEADER, text)
        if first_header:
            insert_at = first_header.start()
            updated = text[:insert_at] + new_block + text[insert_at:]
        else:
            updated = text.rstrip() + "\n\n" + new_block

    # Ensure bottom reference link exists: [0.1.2]: https://github.com/owner/repo/releases/tag/v0.1.2
    if not common.regex.REF_LINE_FOR(version).search(updated):
        if not owner_repo:
            owner_repo = common.parse_owner_repo_from_origin()
        if not owner_repo:
            common.fail("Error: Unable to determine owner/repo from 'origin' to create the version link.")
        link = f"[{version}]: https://github.com/{owner_repo}/releases/tag/v{version}"
        # Append at the very end (Keep a Changelog keeps refs at bottom)
        updated = updated.rstrip() + "\n" + link + "\n"

    changelog_path.write_text(updated, encoding="utf-8")

# def changelog(release):
#     tag = common.normalize_version(release)
#     # Ensure git is available
#     if shutil.which("git") is None:
#         fail("Error: git is not on PATH.")
#
#     # Make sure we have up-to-date remote refs for stable
#     run(["git", "fetch", "--prune", "origin"])
#
#     # Build log command
#     log_cmd = ["git", "log", "--pretty=%s", "--reverse", f"origin/stable..develop", "--no-merges"]
#
#     code, out, err = run(log_cmd)
#     if code != 0:
#         fail(f"Error: git log failed. Details: {err or out or 'unknown'}")
#
#     lines = [l for l in out.splitlines() if l.strip()]
#     if not lines:
#         print("(no new commits on develop relative to origin/stable)", file=sys.stderr)
#         sys.exit(0)
#
#     # Emit simple Markdown suitable to paste into CHANGELOG notes
#     for subj in lines:
#         print(f"- {subj}")

def changelog(release):
    version = common.normalize_version(release)
    if shutil.which("git") is None:
        common.fail("Error: git is not on PATH.")

    # Make sure remote refs are fresh (so origin/stable resolves to latest)
    common.run(["git", "fetch", "--prune", "origin"])

    # Collect commit subjects in develop not in origin/stable
    code, out, err = common.run(["git", "log", "--pretty=%s", "--reverse", "origin/stable..develop", "--no-merges"])
    if code != 0:
        common.fail(f"Error: git log failed. Details: {err or out or 'unknown'}")

    lines = [l for l in out.splitlines() if l.strip()]
    if not lines:
        print("(no new commits on develop relative to origin/stable)", file=sys.stderr)
        sys.exit(0)

    notes_md = "\n".join(f"- {s}" for s in lines)

    changelog_path = Path("CHANGELOG.md")
    _update_changelog_file(changelog_path, version, notes_md, owner_repo=None)

    print(f"CHANGELOG.md updated for [{version}] with {len(lines)} commit(s).")