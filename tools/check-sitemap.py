#!/usr/bin/env python3
"""Fail if any sitemap <loc> is missing from the repo.

Does not add or invent sitemap URLs. Homepage loc maps to index.html;
every other loc must be a real file under the repo root.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "sitemap.xml"
HOST = "https://teamdub.com"

text = SITEMAP.read_text(encoding="utf-8")
locs = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", text)
if not locs:
    print("No <loc> entries in sitemap.xml")
    sys.exit(1)

errors = []
for loc in locs:
    loc = loc.strip()
    if not loc.startswith(HOST):
        errors.append(f"{loc}: not under {HOST}")
        continue
    path = loc[len(HOST) :]
    if path in ("", "/"):
        target = ROOT / "index.html"
    else:
        target = ROOT / path.lstrip("/")
    if not target.is_file():
        errors.append(f"{loc}: missing file {target.relative_to(ROOT)}")

if errors:
    print("Sitemap completeness failed:")
    for item in errors:
        print(f"  {item}")
    sys.exit(1)

print(f"OK: {len(locs)} sitemap URL(s) map to files")
