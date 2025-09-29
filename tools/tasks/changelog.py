import re, shutil, sys
from tools import common
from datetime import date
from pathlib import Path

def _load_codeowners_usernames(path: Path = Path(".github") / "CODEOWNERS") -> set[str]:
    """
    Return a set of GitHub usernames (no leading @) found in CODEOWNERS.
    If file doesn't exist, returns empty set.
    """
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return set()
    # @user OR @org/team → capture the user/team token(s). We only use bare usernames.
    names = set(re.findall(r'@([A-Za-z0-9][A-Za-z0-9\-\/]+)', text))
    # Keep only bare usernames (drop org/team like org/team)
    return {n for n in names if "/" not in n}

def _gh_commit_author_login(owner_repo: str, sha: str) -> str | None:
    """
    Uses `gh` to resolve the GitHub author login for a commit.
    Returns login (str) or None if unknown.
    """
    code, out, err = common.run([
        "gh", "api", f"repos/{owner_repo}/commits/{sha}",
        "--jq", ".author.login // empty"
    ])
    if code != 0:
        return None
    return out.strip() or None

def _version_key(v: str) -> tuple[int, ...]:
    """
    Very light numeric comparator for versions like 0.1.10 vs 0.1.5.
    Extracts all integers and compares lexicographically.
    """
    nums = [int(x) for x in common.regex.CHANGELOG_VERSION_TOKEN.findall(v)]
    return tuple(nums) if nums else (0,)

def _assert_not_lower_than_highest(changelog_path: Path, version: str):
    """
    Fail early if `version` is lower than the highest version heading in the CHANGELOG.
    Looks for headings like: ## [0.1.2] - YYYY-MM-DD
    """
    if not changelog_path.is_file():
        return  # let other checks handle missing file
    text = changelog_path.read_text(encoding="utf-8")
    found = [m.group(1) for m in re.finditer(common.regex.CHANGELOG_VERSION_HEADER, text)]
    # filter out 'Unreleased' if present accidentally
    found = [v for v in found if v.lower() != "unreleased"]
    if not found:
        return
    highest = max(found, key=_version_key)
    if _version_key(version) < _version_key(highest):
        common.fail(f"Error: provided version {version} is lower than highest in CHANGELOG ({highest}).")

def _update_changelog_file(changelog_path: Path, version: str, notes_md: str, owner_repo: str | None):
    if not changelog_path.is_file():
        common.fail(f'Error: CHANGELOG not found at "{changelog_path}".')

    text = changelog_path.read_text(encoding="utf-8")
    today = date.today().strftime("%Y-%m-%d")

    # 1) Upsert the version section
    new_block = f"## [{version}] - {today}\n\n{notes_md.strip()}\n\n"
    m = common.regex.CHANGELOG_HEADER_FOR(version).search(text)

    if m:
        start = m.start()
        next_header = re.search(common.regex.CHANGELOG_NEXT_HEADER, text[m.end():])
        end = m.end() + (next_header.start() if next_header else len(text) - m.end())
        updated = text[:start] + new_block + text[end:]
    # else:
    #     first_header = re.search(common.regex.CHANGELOG_NEXT_HEADER, text)
    #     if first_header:
    #         insert_at = first_header.start()
    #         updated = text[:insert_at] + new_block + text[insert_at:]
    #     else:
    #         updated = text.rstrip() + "\n\n" + new_block
    else:
        # If there's an Unreleased section, insert the new version *after* it and its content,
        # i.e., right before the first actual version header following Unreleased.
        unreleased_hdr = re.search(common.regex.CHANGELOG_UNRELEASED_CHANGES_HEADER, text)
        if unreleased_hdr:
            next_after_unreleased = re.search(common.regex.CHANGELOG_NEXT_HEADER, text[unreleased_hdr.end():])
            if next_after_unreleased:
                insert_at = unreleased_hdr.end() + next_after_unreleased.start()
            else:
                insert_at = len(text)
            updated = text[:insert_at] + new_block + text[insert_at:]
        else:
            # No Unreleased section: insert before the very first version header (top of history)
            first_header = re.search(common.regex.CHANGELOG_NEXT_HEADER, text)
            if first_header:
                insert_at = first_header.start()
                updated = text[:insert_at] + new_block + text[insert_at:]
            else:
                updated = text.rstrip() + "\n\n" + new_block

    # 2) Update the [Unreleased] compare link
    if not owner_repo:
        owner_repo = common.parse_owner_repo_from_origin()
    if not owner_repo:
        common.fail("Error: Unable to determine owner/repo from 'origin' to update [Unreleased] link.")

    unreleased_line = f"[Unreleased]: https://github.com/{owner_repo}/compare/v{version}...HEAD"
    m_unreleased = common.regex.CHANGELOG_UNRELEASED_REF.search(updated)
    if m_unreleased:
        # Replace exactly one line
        start, end = m_unreleased.span()
        updated = updated[:start] + unreleased_line + updated[end:]
        insert_after = updated.find("\n", start)
        insert_pos = (insert_after + 1) if insert_after != -1 else len(updated)
    else:
        # If not present, append and set insertion point after it
        updated = updated.rstrip() + "\n" + unreleased_line + "\n"
        insert_pos = len(updated)

    # 3) Ensure the version reference line exists, and place it *below Unreleased*
    ref_exists = bool(common.regex.REF_LINE_FOR(version).search(updated))
    if not ref_exists:
        vers_ref = f"[{version}]: https://github.com/{owner_repo}/releases/tag/v{version}"
        updated = updated[:insert_pos] + vers_ref + "\n" + updated[insert_pos:]

    changelog_path.write_text(updated, encoding="utf-8")

def changelog(release):
    version = common.normalize_version(release)
    if shutil.which("git") is None:
        common.fail("Error: git is not on PATH.")

    changelog_path = Path("CHANGELOG.md")
    _assert_not_lower_than_highest(changelog_path, version)

    # Ensure remote refs fresh
    common.run(["git", "fetch", "--prune", "origin"])

    owner_repo = common.parse_owner_repo_from_origin() or ""
    codeowners = _load_codeowners_usernames()

    # Collect SHA|subject in develop not in origin/stable
    code, out, err = common.run([
        "git", "log",
        "--pretty=%H|%s",
        "--reverse",
        "origin/stable..develop",
        "--no-merges"
    ])
    if code != 0:
        common.fail(f"Error: git log failed. Details: {err or out or 'unknown'}")

    raw_lines = [l for l in out.splitlines() if l.strip()]
    if not raw_lines:
        print("(no new commits on develop relative to origin/stable)", file=sys.stderr)
        sys.exit(0)

    lines: list[str] = []
    for row in raw_lines:
        try:
            sha, subj = row.split("|", 1)
        except ValueError:
            sha, subj = "", row

        login = _gh_commit_author_login(owner_repo, sha) if sha and owner_repo else None
        if login and login not in codeowners:
            subj = f"{subj} ({login})"
        lines.append(subj)

    notes_md = "\n".join(f"- {s}" for s in lines)
    _update_changelog_file(changelog_path, version, notes_md, owner_repo=owner_repo)

    print(f"CHANGELOG.md updated for [{version}] with {len(lines)} commit(s).")