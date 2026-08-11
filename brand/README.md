# KZ brand kit v1.0

Everything that makes a surface look like yours. Start with `brand-book.html` — open it
in a browser; it is self-contained (fonts and logos are embedded), so it works offline
and can be sent as a single file.

```
brand/
  brand-book.html      ← the brand book. Open this first. Print → Save as PDF to share.
  brand-book.src.html  ← editable source (logos/fonts are injected at build time)
  tokens.css           ← every colour, font and spacing step as CSS variables
  logo/                ← 30 SVGs, letterforms converted to outlines
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
| Title slide, proposal cover, anything centred | `logo/lockup-vertical-ink.svg` |
| Email footer, PDF page furniture | `logo/signature-line-ink.svg` |
| Browser tab | `logo/kz-favicon-small.svg` |

Clear space on all four sides = **half the height of the mark**. Nothing enters it.

Three rules for the dot: never drop it from the primary mark, never make it yellow or
lilac, never change its shape. If the dot doesn't fit, switch to the ligature.

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

## Rebuilding the brand book

`brand-book.html` is generated from `brand-book.src.html` by inlining the fonts and
logo SVGs. Edit the `.src.html` file, then run:

```bash
python3 brand/build.py
```

## Known gap

The website (`../index.html`) still uses **Fraunces**, which contains no Cyrillic —
a Ukrainian version of the site would silently fall back to a system serif. Swapping
the display face to Unbounded and the greens to this palette brings the site in line
with everything here.
