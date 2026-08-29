#!/usr/bin/env python3
"""Fail if any application/ld+json block does not parse as JSON.

Pages with no JSON-LD are skipped. Does not rewrite page copy.
"""

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
PATTERN = re.compile(
    r'<script\s+type=["\']application/ld\+json["\']\s*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)

errors = []
checked = 0
for html_path in sorted(ROOT.glob("*.html")):
    text = html_path.read_text(encoding="utf-8")
    blocks = PATTERN.findall(text)
    for index, block in enumerate(blocks, start=1):
        checked += 1
        try:
            json.loads(block)
        except json.JSONDecodeError as exc:
            errors.append(f"{html_path.name} block {index}: {exc}")

if errors:
    print("JSON-LD parse failed:")
    for item in errors:
        print(f"  {item}")
    sys.exit(1)

print(f"OK: {checked} JSON-LD block(s) parsed")
