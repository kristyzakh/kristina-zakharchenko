#!/usr/bin/env python3
"""Inline the webfonts and logo SVGs into brand-book.src.html.

Usage:  python3 build.py        (run from anywhere; paths are relative to this file)

Produces brand-book.html — one self-contained file with no external requests.
"""
import base64
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "brand-book.src.html")
DST = os.path.join(ROOT, "brand-book.html")

FACES = [
    ("Unbounded", "unbounded.woff2", "100 900"),
    ("Inter Tight", "intertight.woff2", "100 900"),
    ("Inter KZ", "inter.woff2", "100 900"),
    ("Golos Text", "golos.woff2", "400 900"),
    ("Plex Mono KZ", "plexmono-400.woff2", "400"),
    ("Plex Mono KZ", "plexmono-500.woff2", "500"),
]

_seq = [0]


def font_css():
    out = []
    for family, filename, weight in FACES:
        with open(os.path.join(ROOT, "fonts", filename), "rb") as fh:
            data = base64.b64encode(fh.read()).decode()
        out.append(
            f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};"
            f"font-display:block;src:url(data:font/woff2;base64,{data}) format('woff2');}}"
        )
    return "\n".join(out)


def inline_svg(name, cls=""):
    """Inline one logo file: drop its fixed width/height, namespace its ids, add a class."""
    with open(os.path.join(ROOT, "logo", name)) as fh:
        svg = fh.read()
    svg = re.sub(r'\s(width|height)="[\d.]+"', "", svg, count=2)
    _seq[0] += 1
    uid = f"l{_seq[0]}"
    for ident in set(re.findall(r'id="([^"]+)"', svg)):
        svg = svg.replace(f'id="{ident}"', f'id="{ident}-{uid}"')
        svg = svg.replace(f"url(#{ident})", f"url(#{ident}-{uid})")
    if cls:
        svg = svg.replace("<svg ", f'<svg class="{cls}" ', 1)
    return svg


def main():
    with open(SRC) as fh:
        html = fh.read()
    html = html.replace("/*FONTS*/", font_css())
    html = re.sub(
        r"<!--LOGO:([\w.-]+)(?::([\w -]+))?-->",
        lambda m: inline_svg(m.group(1), m.group(2) or ""),
        html,
    )
    leftover = re.findall(r"<!--LOGO:[^>]*-->", html)
    if leftover:
        sys.exit(f"unresolved logo placeholders: {leftover}")
    with open(DST, "w") as fh:
        fh.write(html)
    print(f"{DST}  {len(html) / 1024:.0f} KB  ({_seq[0]} logos inlined)")


if __name__ == "__main__":
    main()
