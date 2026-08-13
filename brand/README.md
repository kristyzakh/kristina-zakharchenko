# KZ brand kit v1.1

Everything that makes a surface look like yours. Start with `brand-book.html` — open it
in a browser; it is self-contained (fonts and logos are embedded), so it works offline
and can be sent as a single file.

```
brand/
  brand-book.html      ← the brand book. Open this first. Print → Save as PDF to share.
  brand-book.src.html  ← editable source (logos/fonts are injected at build time)
  make-logos.py        ← regenerates every logo SVG from the fonts
  build.py             ← folds fonts + logos into brand-book.html
  tokens.css           ← every colour, font and spacing step as CSS variables
  logo/                ← 34 SVGs, letterforms converted to outlines
  fonts/               ← the 5 faces, subset to Latin + Cyrillic, as .woff2
```

## The five-second version

| | |
|---|---|
| **Display / titles** | Unbounded Bold 700 — EN and UA |
| **Headings** | Inter Tight Bold 700 (EN) · Golos Text Bold 700 (UA) |
| **Body** | Inter 400/500 — EN and UA |
| **Data, labels, eyebrows** | IBM Plex Mono Medium 500, uppercase, wide tracking |
| **Colours** | Ink `#16110F` · Paper `#FAF7F2` · Bubblegum `#FF9BD8` · Magenta `#C2246E` · Butter `#F4EDA0` |
| **Ratio** | ≈ 62% ground / 26% ink / 9% pink / 3% yellow |
| **Per surface** | one display line · one pink element · all labels in mono |

Pink and yellow are **surfaces you put ink on**, never the ink itself — the one
exception is bubblegum set very large (40 px+) on an ink ground.

## Two marks

**`KZ.`** is the primary logo — your initials and a full stop, redrawn from the site
header in Unbounded. The dot carries the accent colour: **magenta on light grounds,
bubblegum on ink and imagery**. It holds down to about 20 px.

**The ligature** (K and Z interlocked on a shared diagonal) is the compact mark, for
anywhere the dot would be lost — avatars, favicons, app tiles, table headers, stamps.

| Situation | File |
|---|---|
| Default, on light | `logo/kz-dot-ink.svg` |
| On a dark ground or imagery | `logo/kz-dot-cream.svg` |
| One colour only (engraving, fax-grade PDF) | `logo/kz-dot-ink-solid.svg` · `kz-dot-magenta.svg` |
| Avatar, app tile, anything square | `logo/kz-avatar-circle-ink.svg` · `kz-badge-ink.svg` |
| 20–24 px | `logo/kz-monogram-ink.svg` (ligature) |
| Under 24 px — favicon, table headers | `logo/kz-monogram-small-size-ink.svg` |
| Covers, launch posts, slide one | `logo/kz-monogram-duotone.svg` (overprint) |
| Document header, letterhead, deck footer | `logo/lockup-horizontal-ink.svg` |
| Title slide, anything centred | `logo/lockup-vertical-ink.svg` |
| Proposal cover, LinkedIn banner, deck slide one | `logo/lockup-horizontal-focus-ink.svg` · `-cream.svg` |
| Email footer, PDF page furniture | `logo/signature-line-ink.svg` |
| Browser tab | `logo/kz-favicon-small.svg` |

Clear space on all four sides = **half the height of the mark**. Nothing enters it.

Three rules for the dot: never drop it from the primary mark, never make it yellow or
lilac, never change its shape. If the dot doesn't fit, switch to the ligature.

## How the name is written

| Where | Wording |
|---|---|
| Logo lockups, page furniture | `DIGITAL & PERFORMANCE MARKETING` |
| Focus lockups, banners, proposal covers | + `E-COMMERCE · LEAD GENERATION` underneath |
| Site title, email signature | Kristina Zakharchenko — Digital & Performance Marketing |
| First person, bios, captions | "I'm a digital and performance marketer" |
| Ukrainian | Цифровий та performance-маркетинг · E-commerce · лідогенерація |

The discipline form goes under the name because a line under a name reads as a field,
not a job title. Keep **E-commerce** spelled out everywhere a client reads it; `E-com`
is fine on Instagram.

Never both tiers on one page — the focus line is for the surface where someone is
deciding whether you're for them, not for every footer.

**Past job titles don't change.** "Performance Marketing Manager" and "Performance
Marketing Specialist" in the case studies are employment history, not positioning.

## Setting up your tools (do this once)

**Google Docs / Slides / Sheets** — Fonts → More fonts → add Unbounded, Inter Tight,
Inter, Golos Text, IBM Plex Mono. Then build one template doc and one template deck
with the styles applied and start every client file from those.

**Canva** — Brand Kit: add the five hex values, upload the logo SVGs, upload the font
files. Unbounded isn't in Canva's default library; if you can't upload fonts on your
plan, use Golos Text 800 for display and note the substitution.

**Looker Studio** — theme fonts are limited: use Inter throughout with IBM Plex Mono
for labels, and set the chart palette to
`#C2246E, #2F6BD8, #B8820A, #03917A, #7B4BD9, #D9482F` (light) or
`#E14A86, #5B93EE, #BC8C15, #12A88C, #9578E0, #DD5E39` (dark).

**Word / PowerPoint** — install the fonts locally first, then turn on *embed fonts*
when saving, or the client sees Calibri.

**Email signature** — webfonts don't survive email. Set it in Arial and export
`kz-dot-ink.svg` to PNG at 2× (150 px wide).

## Working in Ukrainian

- Headings swap to **Golos Text**; title, body and data faces don't change.
- Ukrainian runs 10–15% longer than English — leave headline room, shorten the
  sentence rather than the type size.
- Decimal comma (`3,4`), space for thousands (`84 120`), hryvnia after the number.
- Check `ґ Ґ є Є і І ї Ї ₴` render in the right face before sending. If one letter
  looks different from the rest of the line, the font has fallen back.
- Quotes are «lapky»; the apostrophe is ’ (U+2019), not `'`.

## Changing things

Both scripts need `fontTools`, once: `pip3 install fonttools brotli`

**To change the wording under the name** (role or focus line) — edit the CONSTANTS
block at the top of `make-logos.py`, then:

```bash
python3 brand/make-logos.py && python3 brand/build.py
```

`make-logos.py` rewrites all 34 SVGs from the fonts, converting the letterforms to
outline paths so the files never depend on Unbounded being installed. It is
deterministic: running it without changing anything reproduces the current files
byte-for-byte, so a `git diff` after running it shows exactly what your edit changed
and nothing else.

**To change colours, sizes or spacing** — the same CONSTANTS block holds the palette,
cap height, and the letter gaps for each mark. The `FILES` dict at the bottom maps every
output filename to how it's built; add a line there to add a variant.

**To edit the brand book's own text** — edit `brand-book.src.html`, then run
`build.py`. Never edit `brand-book.html` directly; it's generated and your changes
will be overwritten.

**After any change**, commit and push — the live copy at
`kristyzakh.github.io/kristina-zakharchenko/brand/brand-book.html` updates on push.

## The website

`../index.html` is built on this kit: it links `tokens.css` directly, loads the five
faces from `fonts/`, and uses `logo/kz-dot-ink.svg` in the header and
`logo/kz-dot-cream.svg` on the ink hero. Display is Unbounded, headings Inter Tight,
labels IBM Plex Mono, and the accent is magenta with bubblegum reserved for fills.
Because nothing on the page depends on Fraunces any more, a Ukrainian version only
needs `lang="uk"` on `<html>` for headings to swap to Golos Text.
