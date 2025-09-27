import subprocess, re, sys
from pathlib import Path
from datetime import datetime

# def run(*popenargs,
#         input=None, capture_output=False, timeout=None, check=False, **kwargs):
def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout.strip(), p.stderr.strip()

def parse_owner_repo_from_origin():
    code, out, err = run(["git", "remote", "get-url", "origin"])
    if code != 0 or not out:
        return None
    url = out.strip()

    # https://github.com/owner/repo(.git)?
    m = re.match(regex.GITHUB_HTTPS_REMOTE, url)
    if m:
        return f"{m.group(1)}/{m.group(2)}"

    # git@github.com:owner/repo(.git)?
    m = re.match(regex.GITHUB_SSH_REMOTE, url)
    if m:
        return f"{m.group(1)}/{m.group(2)}"

    return None

def fail(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)

def project_root():
    return Path(__file__).resolve().parent.parent

def now_tmz():
    return datetime.now().astimezone()

def normalize_version(version):
    return version.lstrip('v')

class _RegexNS:
    """Compiled regex patterns and helpers. Use as: common.regex.NAME"""

    # --- Git remotes ---
    GITHUB_HTTPS_REMOTE = re.compile(r"https?://[^/]+/([^/]+)/([^/]+?)(?:\.git)?$")
    GITHUB_SSH_REMOTE   = re.compile(r"git@[^:]+:([^/]+)/([^/]+?)(?:\.git)?$")

    # --- Changelog headings/sections ---
    # Next section header (kept once; duplicate removed)
    CHANGELOG_NEXT_HEADER = re.compile(r"(?m)^##\s*\[")

    # Version-specific header like: ## [0.1.2] - 2025-09-27
    @staticmethod
    def CHANGELOG_HEADER_FOR(version: str):
        return re.compile(
            rf"(?m)^##\s*\[\s*v?{re.escape(version)}\s*\]\s*(?:-\s*\d{{4}}-\d{{2}}-\d{{2}})?\s*$"
        )

    # --- Changelog reference links at bottom ---
    # E.g.: [0.1.2]: https://github.com/OWNER/REPO/releases/tag/v0.1.2
    @staticmethod
    def REF_LINE_FOR(version: str):
        return re.compile(
            rf"(?mi)^\[\s*v?{re.escape(version)}\s*\]\s*:\s*\S+\s*$"
        )

    @staticmethod
    def REF_LINE_URL_FOR(version: str):
        return re.compile(
            rf"(?mi)^\[\s*v?{re.escape(version)}\s*\]\s*:\s*(?P<url>\S+)\s*$"
        )

    # --- JS export parsing (for your other tools) ---
    EXPORT_DECL = re.compile(r"export\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_]+)")
    EXPORT_LIST = re.compile(r"export\s*\{\s*([^}]+)\s*\}")
    EXPORT_AS   = re.compile(r"\s+as\s+")

# public namespace object
regex = _RegexNS()

# r"https?://[^/]+/([^/]+)/([^/]+?)(?:\.git)?$"
# r"git@[^:]+:([^/]+)/([^/]+?)(?:\.git)?$"

# rf"(?m)^##\s*\[\s*v?{re.escape(version)}\s*\]\s*(?:-\s*\d{{4}}-\d{{2}}-\d{{2}})?\s*$"
# rf'(?m)^##\s*\[\s*v?{re.escape(version)}\s*\]\s*(?:-\s*\d{{4}}-\d{{2}}-\d{{2}})?\s*$'

# r'(?m)^##\s*\['
# r'(?m)^##\s*\['

# rf'(?mi)^\[\s*v?{re.escape(version)}\s*\]\s*:\s*\S+\s*$'
# r"export\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_]+)"
# r"export\s*\{\s*([^}]+)\s*\}"
# r"\s+as\s+"
# rf'(?mi)^\[\s*v?{re.escape(version)}\s*\]\s*:\s*(?P<url>\S+)\s*$'