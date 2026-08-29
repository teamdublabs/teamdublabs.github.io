#!/usr/bin/env python3
"""Fail if a shareable page is missing required Open Graph tags.

Shareable means every HTML page except 404.html (error page, noindex).
Required tags: og:title, og:description, og:image, og:url.
"""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ("og:title", "og:description", "og:image", "og:url")
SKIP = {"404.html"}

PROP_FIRST = re.compile(
    r'<meta\s+property=["\'](og:[^"\']+)["\']\s+content=["\']([^"\']*)["\']',
    re.IGNORECASE,
)
CONTENT_FIRST = re.compile(
    r'<meta\s+content=["\']([^"\']*)["\']\s+property=["\'](og:[^"\']+)["\']',
    re.IGNORECASE,
)


def og_props(html):
    found = set()
    for match in PROP_FIRST.finditer(html):
        if match.group(2).strip():
            found.add(match.group(1).lower())
    for match in CONTENT_FIRST.finditer(html):
        if match.group(1).strip():
            found.add(match.group(2).lower())
    return found


errors = []
checked = 0
for html_path in sorted(ROOT.glob("*.html")):
    if html_path.name in SKIP:
        continue
    checked += 1
    found = og_props(html_path.read_text(encoding="utf-8"))
    missing = [name for name in REQUIRED if name not in found]
    if missing:
        errors.append(f"{html_path.name}: missing {', '.join(missing)}")

if errors:
    print("OG metadata failed:")
    for item in errors:
        print(f"  {item}")
    sys.exit(1)

print(
    f"OK: {checked} shareable page(s) have "
    "og:title, og:description, og:image, og:url"
)
