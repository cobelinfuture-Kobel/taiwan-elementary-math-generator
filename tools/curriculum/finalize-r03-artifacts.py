from __future__ import annotations

import base64
import hashlib
import json
import os
from pathlib import Path
import tarfile
import urllib.request

REPOSITORY = os.environ["GITHUB_REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
EXPECTED_SHA256 = "cda67fa8389d28b80e8fd8a935f4ae0d399607559e5346820a046786a003db1d"
BLOB_SHAS = [
    "e45c24cf03022aadf889f76a921d634d0b00f6d4",
    "380e00bb12642d447a18bdffad339714b2b5a776",
    "e8d1e2f49b99af54cbe66d4b63ea80f58595c92c",
    "896e44b4a0aee7816d35a37723d28ffb47645841",
    "34d41ed18e4c7c62e9fc780056ea16d6fe651d2e",
    "cc2f493230dbf93ca0905d01f77b2065c8831cf3",
    "1f3bb024e5e4dec1b23550f6897c85a5ea4938ff",
    "609f84c43d5e03e5dc930342c30c94605948b315",
    "0a7ba54d7eff2c2b4002972b7ec6d861ac300d26",
    "c3fd83a4427fadedae5e8fa29cdfcd8089b5a11c",
    "c52d6535a71648d42a6b56478c3ac8a2bad578ba",
    "9b7a0028879437356b28d699b521d0addf204a64",
    "77d1040e235a57dadb7f82a4162376684bb872c9",
    "8684be3602a64004cd53d72d1ac4293f95bb6d46",
    "fb708bc3884110e3f2a5267894bad4d766c2f2d3",
    "edbd0dfc03ff6f6c41b9643c1a40e12306fecb4a",
    "a0474b98c96beb14c5d79f2b9162a6c0a819341c",
    "fee4d31ebe82e40e3a43e9239a03e659bcb2145a",
    "88ff414fc06b8cd3ccc5bb0d537b94f2458d9c0d",
]


def fetch_blob_text(sha: str) -> bytes:
    request = urllib.request.Request(
        f"https://api.github.com/repos/{REPOSITORY}/git/blobs/{sha}",
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(request) as response:
        payload = json.load(response)
    return base64.b64decode(payload["content"])


root = Path.cwd()
bundle_b64 = b"".join(fetch_blob_text(sha) for sha in BLOB_SHAS)
archive_bytes = base64.b64decode(bundle_b64, validate=True)
actual_sha256 = hashlib.sha256(archive_bytes).hexdigest()
if actual_sha256 != EXPECTED_SHA256:
    raise SystemExit(
        f"R03_ARCHIVE_SHA256_MISMATCH expected={EXPECTED_SHA256} actual={actual_sha256}"
    )

archive_path = root / "tmp" / "r03-artifacts.tar.gz"
archive_path.parent.mkdir(parents=True, exist_ok=True)
archive_path.write_bytes(archive_bytes)
with tarfile.open(archive_path, "r:gz") as archive:
    archive.extractall(root, filter="data")

for obsolete in [
    ".github/workflows/r03-export-global-kp-node-snapshot.yml",
    "tools/curriculum/export-r03-global-kp-node-snapshot.mjs",
    ".github/workflows/r03-finalize-artifacts.yml",
    "tools/curriculum/finalize-r03-artifacts.py",
]:
    path = root / obsolete
    if path.exists():
        path.unlink()

print(
    "R03_ARTIFACT_MATERIALIZATION_PASS "
    f"chunks={len(BLOB_SHAS)} base64_chars={len(bundle_b64)} sha256={actual_sha256}"
)
