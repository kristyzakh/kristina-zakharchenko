#!/usr/bin/env python3
"""Regenerate the whole KZ logo family from the brand fonts.

    python3 brand/make-logos.py          # rewrites every file in brand/logo/

Every SVG is pure vector — the letterforms are pulled out of Unbounded and Inter
Tight and written as outline paths, so the files render identically whether or not
the fonts are installed. Nothing here depends on a font being available at view time.

Change the role or focus wording in the CONSTANTS block below, run the script, then
run build.py to fold the new files back into the brand book.

Requires: fontTools + brotli   ->   pip3 install fonttools brotli
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

ROOT = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(ROOT, "fonts")
OUT = os.path.join(ROOT, "logo")

# ---------------------------------------------------------------- CONSTANTS
INK = "#16110F"
PAPER = "#FAF7F2"
BUBBLE = "#FF9BD8"
MAGENTA = "#C2246E"
BUTTER = "#F4EDA0"
SUN = "#EFD84C"

ROLE = "DIGITAL & PERFORMANCE MARKETING"     # the line under the name
FOCUS = "E-COMMERCE · LEAD GENERATION"       # only on the -focus- lockups
SIG_ROLE = "Digital & Performance Marketing"  # sentence case, for the signature line

CAP = 75.0        # cap height of Unbounded at size 100
LIG = -14         # letter gap in the compact ligature
SMALL_GAP = 2     # letter gap in the small-size cut
DOT_KZ = 4        # letter gap in the primary KZ. mark
DOT_GAP = 16      # space between Z and the full stop

_cache = {}


# ---------------------------------------------------------------- TYPE
def load(filename, wght):
    key = (filename, wght)
    if key not in _cache:
        font = TTFont(os.path.join(FONTS, filename))
        _cache[key] = instantiateVariableFont(font, {"wght": wght}, inplace=True,
                                              updateFontNames=False)
    return _cache[key]


def UNB():   return load("unbounded.woff2", 700)   # mark, wordmarks
def UNB6():  return load("unbounded.woff2", 600)   # name in lockups
def ITM():   return load("intertight.woff2", 500)  # role lines
def ITS():   return load("intertight.woff2", 600)  # name in the signature line


def glyph(font, ch, size=100, x=0.0, y=0.0):
    """One glyph as an SVG path, y-down, baseline at y."""
    upm = font["head"].unitsPerEm
    gs = font.getGlyphSet()
    name = font.getBestCmap()[ord(ch)]
    s = size / upm
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}")
    gs[name].draw(TransformPen(pen, Transform(s, 0, 0, -s, x, y)))
    bounds = BoundsPen(gs)
    gs[name].draw(bounds)
    xmin, ymin, xmax, ymax = bounds.bounds
    return {"d": pen.getCommands(), "adv": font["hmtx"][name][0] * s,
            "x0": x + xmin * s, "x1": x + xmax * s}


def line(font, text, size=100, x=0.0, y=0.0, tracking=0.0):
    """A string as one path. Returns (d, ink_left, ink_right)."""
    parts, cur, ink0, ink1 = [], x, None, None
    space = font["hmtx"][font.getBestCmap()[32]][0] * size / font["head"].unitsPerEm
    for ch in text:
        if ch == " ":
            cur += space + tracking * size
            continue
        g = glyph(font, ch, size, cur, y)
        parts.append(g["d"])
        ink0 = g["x0"] if ink0 is None else min(ink0, g["x0"])
        ink1 = g["x1"] if ink1 is None else max(ink1, g["x1"])
        cur += g["adv"] + tracking * size
    return " ".join(parts), ink0 or 0, ink1 or 0


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.2f}" height="{h:.2f}" '
            f'viewBox="0 0 {w:.2f} {h:.2f}" role="img" aria-label="Kristina Zakharchenko">'
            f'{body}</svg>')


# ---------------------------------------------------------------- MARKS
def dot_paths(size=100):
    """The primary mark: K, Z and the full stop, ink box starting at (0,0)."""
    s = size / 100.0
    f = UNB()
    k = glyph(f, "K", size)
    z0, d0 = glyph(f, "Z", size), glyph(f, ".", size)
    z = glyph(f, "Z", size, x=(k["x1"] + DOT_KZ * s) - z0["x0"])
    d = glyph(f, ".", size, x=(z["x1"] + DOT_GAP * s) - d0["x0"])
    return {"k": k["d"], "z": z["d"], "dot": d["d"],
            "w": d["x1"] - k["x0"], "h": CAP * s, "tx": -k["x0"], "ty": CAP * s}


def mono_paths(size=100, gap=LIG):
    """The compact ligature: K and Z sharing a diagonal."""
    s = size / 100.0
    f = UNB()
    k = glyph(f, "K", size)
    z0 = glyph(f, "Z", size)
    z = glyph(f, "Z", size, x=(k["x1"] + gap * s) - z0["x0"])
    return {"k": k["d"], "z": z["d"], "w": z["x1"] - k["x0"], "h": CAP * s,
            "tx": -k["x0"], "ty": CAP * s}


def paint(m, color, dot=None):
    out = f'<path d="{m["k"]}" fill="{color}"/><path d="{m["z"]}" fill="{color}"/>'
    if "dot" in m:
        out += f'<path d="{m["dot"]}" fill="{dot or color}"/>'
    return out


def dotmark(size=200, color=INK, dot=MAGENTA):
    m = dot_paths(size)
    body = f'<g transform="translate({m["tx"]:.2f},{m["ty"]:.2f})">{paint(m, color, dot)}</g>'
    return svg(m["w"], m["h"], body)


def monogram(size=200, color=INK, gap=LIG):
    m = mono_paths(size, gap)
    body = f'<g transform="translate({m["tx"]:.2f},{m["ty"]:.2f})">{paint(m, color)}</g>'
    return svg(m["w"], m["h"], body)


def monogram_duotone(size=200, c_k=BUBBLE, c_z=SUN, c_x=MAGENTA):
    """Overprint. The overlap is a real filled shape (clip-path), not a blend
    mode, so it survives PDF export and print."""
    m = mono_paths(size)
    body = (f'<defs><clipPath id="kzclip"><path d="{m["k"]}"/></clipPath></defs>'
            f'<g transform="translate({m["tx"]:.2f},{m["ty"]:.2f})">'
            f'<path d="{m["z"]}" fill="{c_z}"/><path d="{m["k"]}" fill="{c_k}"/>'
            f'<g clip-path="url(#kzclip)"><path d="{m["z"]}" fill="{c_x}"/></g></g>')
    return svg(m["w"], m["h"], body)


def badge(size=160, bg=INK, fg=PAPER, shape="rect", radius=None, gap=LIG,
          pad_ratio=0.34):
    m = mono_paths(size, gap)
    pad = m["h"] * pad_ratio
    if shape == "circle":
        d = m["w"] + pad * 3.4
        w = h = d
        plate = f'<circle cx="{d/2:.2f}" cy="{d/2:.2f}" r="{d/2:.2f}" fill="{bg}"/>'
    else:
        w, h = m["w"] + pad * 2, m["h"] + pad * 2
        if shape == "square":
            w = h = max(w, h)
        r = m["h"] * 0.26 if radius is None else radius
        plate = f'<rect width="{w:.2f}" height="{h:.2f}" rx="{r:.2f}" fill="{bg}"/>'
    ox, oy = (w - m["w"]) / 2, (h - m["h"]) / 2
    body = plate + (f'<g transform="translate({m["tx"]+ox:.2f},{m["ty"]+oy:.2f})">'
                    f'{paint(m, fg)}</g>')
    return svg(w, h, body)


# ---------------------------------------------------------------- WORDMARKS
def wordmark_stacked(size=64, color=INK, tracking=-0.01, lead=1.20):
    d1, a1, b1 = line(UNB(), "KRISTINA", size, tracking=tracking)
    d2, a2, b2 = line(UNB(), "ZAKHARCHENKO", size, tracking=tracking)
    cap = CAP * size / 100
    body = (f'<g transform="translate({-a1:.2f},{cap:.2f})"><path d="{d1}" fill="{color}"/></g>'
            f'<g transform="translate({-a2:.2f},{cap + cap*lead:.2f})"><path d="{d2}" fill="{color}"/></g>')
    return svg(max(b1 - a1, b2 - a2), cap + cap * lead, body)


def wordmark_inline(size=48, color=INK, tracking=-0.005):
    d, a, b = line(UNB(), "KRISTINA ZAKHARCHENKO", size, tracking=tracking)
    cap = CAP * size / 100
    return svg(b - a, cap, f'<g transform="translate({-a:.2f},{cap:.2f})"><path d="{d}" fill="{color}"/></g>')


def signature(size=30, color=INK, role=SIG_ROLE):
    d1, a1, b1 = line(ITS(), "Kristina Zakharchenko", size)
    d2, a2, b2 = line(ITM(), f"— {role}", size, x=b1 + size * 0.42)
    cap = 0.727 * size
    body = (f'<g transform="translate(0,{cap:.2f})"><path d="{d1}" fill="{color}"/>'
            f'<path d="{d2}" fill="{color}" opacity="0.62"/></g>')
    return svg(b2, cap * 1.34, body)


# ---------------------------------------------------------------- LOCKUPS
def lockup_h(size=96, color=INK, dot=MAGENTA, role=ROLE, focus=None, mark_color=None):
    """Mark | rule | name over role. `focus` adds the specialisation line."""
    m = dot_paths(size) if dot else mono_paths(size)
    gap = m["h"] * 0.42
    rule_x = m["w"] + gap
    tx = rule_x + gap
    ns, rs = size * 0.44, size * 0.20
    d1, a1, b1 = line(UNB6(), "KRISTINA", ns)
    d2, a2, b2 = line(UNB6(), "ZAKHARCHENKO", ns)
    rows = [line(ITM(), role, rs, tracking=0.14)]
    if focus:
        rows.append(line(ITM(), focus, rs, tracking=0.14))
    ncap = CAP * ns / 100
    lead = ncap * 1.30
    blockh = ncap + lead + rs * 1.5 * len(rows)
    h = max(m["h"], blockh)
    oy, ty = (h - m["h"]) / 2, (h - blockh) / 2
    w = tx + max(b1 - a1, b2 - a2, *[r[2] - r[1] for r in rows])
    body = (f'<g transform="translate({m["tx"]:.2f},{m["ty"]+oy:.2f})">'
            f'{paint(m, mark_color or color, dot)}</g>'
            f'<rect x="{rule_x:.2f}" y="{oy:.2f}" width="{max(1.6, size*0.018):.2f}" '
            f'height="{m["h"]:.2f}" fill="{color}" opacity="0.22"/>'
            f'<g transform="translate({tx - a1:.2f},{ty + ncap:.2f})"><path d="{d1}" fill="{color}"/></g>'
            f'<g transform="translate({tx - a2:.2f},{ty + ncap + lead:.2f})"><path d="{d2}" fill="{color}"/></g>')
    ry = ty + ncap + lead + rs * 1.35
    for i, (d, a, b) in enumerate(rows):
        body += (f'<g transform="translate({tx - a:.2f},{ry:.2f})">'
                 f'<path d="{d}" fill="{color}" opacity="{"0.6" if i == 0 else "0.42"}"/></g>')
        ry += rs * 1.45
    return svg(w, h, body)


def lockup_v(size=120, color=INK, dot=MAGENTA, role=ROLE, focus=None, mark_color=None):
    m = dot_paths(size) if dot else mono_paths(size)
    ns, rs = size * 0.30, size * 0.135
    d1, a1, b1 = line(UNB6(), "KRISTINA ZAKHARCHENKO", ns)
    rows = [line(ITM(), role, rs, tracking=0.16)]
    if focus:
        rows.append(line(ITM(), focus, rs, tracking=0.16))
    ncap = CAP * ns / 100
    w = max(m["w"], b1 - a1, *[r[2] - r[1] for r in rows])
    gap1, gap2 = m["h"] * 0.40, ncap * 0.85
    h = m["h"] + gap1 + ncap + gap2 + rs * (1 + 1.5 * (len(rows) - 1))
    body = (f'<g transform="translate({m["tx"] + (w-m["w"])/2:.2f},{m["ty"]:.2f})">'
            f'{paint(m, mark_color or color, dot)}</g>'
            f'<g transform="translate({(w-(b1-a1))/2 - a1:.2f},{m["h"]+gap1+ncap:.2f})">'
            f'<path d="{d1}" fill="{color}"/></g>')
    ry = m["h"] + gap1 + ncap + gap2 + rs * 0.75
    for i, (d, a, b) in enumerate(rows):
        body += (f'<g transform="translate({(w-(b-a))/2 - a:.2f},{ry:.2f})">'
                 f'<path d="{d}" fill="{color}" opacity="{"0.6" if i == 0 else "0.42"}"/></g>')
        ry += rs * 1.5
    return svg(w, h, body)


# ---------------------------------------------------------------- THE SET
FILES = {
    # primary mark — KZ.
    "kz-dot-ink.svg":              lambda: dotmark(200, INK, MAGENTA),
    "kz-dot-ink-solid.svg":        lambda: dotmark(200, INK, INK),
    "kz-dot-ink-bubblegum.svg":    lambda: dotmark(200, INK, BUBBLE),
    "kz-dot-cream.svg":            lambda: dotmark(200, PAPER, BUBBLE),
    "kz-dot-cream-solid.svg":      lambda: dotmark(200, PAPER, PAPER),
    "kz-dot-magenta.svg":          lambda: dotmark(200, MAGENTA, MAGENTA),
    # compact ligature
    "kz-monogram-ink.svg":         lambda: monogram(200, INK),
    "kz-monogram-cream.svg":       lambda: monogram(200, PAPER),
    "kz-monogram-magenta.svg":     lambda: monogram(200, MAGENTA),
    "kz-monogram-small-size-ink.svg": lambda: monogram(200, INK, SMALL_GAP),
    "kz-monogram-duotone.svg":     lambda: monogram_duotone(200),
    # containers
    "kz-badge-ink.svg":            lambda: badge(160, INK, PAPER),
    "kz-badge-pink.svg":           lambda: badge(160, BUBBLE, INK),
    "kz-badge-butter.svg":         lambda: badge(160, BUTTER, INK),
    "kz-badge-square-ink.svg":     lambda: badge(160, INK, PAPER, shape="square"),
    "kz-avatar-circle-ink.svg":    lambda: badge(150, INK, PAPER, shape="circle"),
    "kz-avatar-circle-pink.svg":   lambda: badge(150, BUBBLE, INK, shape="circle"),
    "kz-favicon.svg":              lambda: badge(120, INK, PAPER, shape="square", radius=0),
    "kz-favicon-small.svg":        lambda: badge(120, INK, PAPER, shape="square", radius=0, gap=SMALL_GAP),
    # wordmarks
    "wordmark-stacked-ink.svg":    lambda: wordmark_stacked(64, INK),
    "wordmark-stacked-cream.svg":  lambda: wordmark_stacked(64, PAPER),
    "wordmark-inline-ink.svg":     lambda: wordmark_inline(48, INK),
    "signature-line-ink.svg":      lambda: signature(30, INK),
    "signature-line-cream.svg":    lambda: signature(30, PAPER),
    # lockups — plain tier carries the discipline only
    "lockup-horizontal-ink.svg":         lambda: lockup_h(96, INK, MAGENTA),
    "lockup-horizontal-cream.svg":       lambda: lockup_h(96, PAPER, BUBBLE),
    "lockup-horizontal-accent.svg":      lambda: lockup_h(96, INK, MAGENTA, mark_color=MAGENTA),
    "lockup-horizontal-compact-ink.svg": lambda: lockup_h(96, INK, None),
    "lockup-vertical-ink.svg":           lambda: lockup_v(120, INK, MAGENTA),
    "lockup-vertical-cream.svg":         lambda: lockup_v(120, PAPER, BUBBLE),
    # lockups — focus tier adds the specialisation line
    "lockup-horizontal-focus-ink.svg":   lambda: lockup_h(96, INK, MAGENTA, focus=FOCUS),
    "lockup-horizontal-focus-cream.svg": lambda: lockup_h(96, PAPER, BUBBLE, focus=FOCUS),
    "lockup-vertical-focus-ink.svg":     lambda: lockup_v(120, INK, MAGENTA, focus=FOCUS),
    "lockup-vertical-focus-cream.svg":   lambda: lockup_v(120, PAPER, BUBBLE, focus=FOCUS),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, make in FILES.items():
        with open(os.path.join(OUT, name), "w") as fh:
            fh.write(make())
    print(f"wrote {len(FILES)} SVGs to {OUT}")
    print("next: python3 brand/build.py   (folds them into the brand book)")


if __name__ == "__main__":
    main()
