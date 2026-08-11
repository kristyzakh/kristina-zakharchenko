# Kristina Zakharchenko — Performance Marketing site

Single-page site (`index.html`, `styles.css`, `script.js`), no build step. Framed around Jobs-to-be-Done: situations → jobs → case studies → toolkit → contact.

## Preview locally

```bash
python3 -m http.server 8934
```

Then open http://localhost:8934

## Brand

The full identity — logo files, palette, EN/UA typography, tone of voice — lives in
[`brand/`](brand/). Start with [`brand/brand-book.html`](brand/brand-book.html); it is
self-contained, so it opens offline and prints straight to PDF. See
[`brand/README.md`](brand/README.md) for which logo file to use where.

## Deploy — GitHub Pages

Hosted at **https://kristyzakh.github.io/kristina-zakharchenko/**

```bash
git push -u origin main
```

Then: repo Settings → Pages → Deploy from branch → `main` / `/ (root)`. First build
takes a minute or two. After that, every `git push` republishes.

The brand book sits at `/brand/brand-book.html` and carries a `noindex` tag — reachable
by anyone with the link, but not indexed and not linked from the site. To surface it
publicly, uncomment the footer link in `index.html`.

## Updating content

- Copy/results: edit `index.html` directly (each case study is one `<article class="case">` block).
- Colors/fonts: edit the `:root` tokens at the top of `styles.css`.
- CV file: replace `assets/Kristina-Zakharchenko-CV.docx` (keep the same filename, or update the two `href` links in `index.html`).

## Still to add

- Real screenshots (dashboards, ad creatives, results charts) — drop into `assets/` and reference in the relevant `.case` block.
- Once you have a Formspree account (or similar), swap the mailto handler in `script.js` for a real form POST if you want submissions to land in an inbox instead of opening the visitor's email client.
