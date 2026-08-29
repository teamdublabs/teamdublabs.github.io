#!/usr/bin/env python3
"""Fail if any HTML page is missing the Cloudflare Web Analytics beacon.

Every *.html file, including 404.html, must include beacon.min.js and
data-cf-beacon with the published site token.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
TOKEN = "5b6a5ecfde2c47e287e191eb7d5943e3"
BEACON_SRC = re.compile(r"beacon\.min\.js", re.IGNORECASE)
BEACON_ATTR = re.compile(r"data-cf-beacon", re.IGNORECASE)

errors = []
checked = 0
for html_path in sorted(ROOT.glob("*.html")):
    checked += 1
    text = html_path.read_text(encoding="utf-8")
    missing = []
    if not BEACON_SRC.search(text):
        missing.append("beacon.min.js")
    if not BEACON_ATTR.search(text) or TOKEN not in text:
        missing.append(f"data-cf-beacon token {TOKEN}")
    if missing:
        errors.append(f"{html_path.name}: missing {', '.join(missing)}")

if errors:
    print("Cloudflare Web Analytics failed:")
    for item in errors:
        print(f"  {item}")
    sys.exit(1)

print(f"OK: {checked} page(s) include the Cloudflare Web Analytics beacon")
