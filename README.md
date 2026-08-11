# Kristina Zakharchenko — Performance Marketing site

Single-page site (`index.html`, `styles.css`, `script.js`), no build step. Framed around Jobs-to-be-Done: situations → jobs → case studies → toolkit → contact.

## Preview locally

```bash
python3 -m http.server 8934
```

Then open http://localhost:8934

## Deploy (free, keeps one stable link)

**GitHub Pages**
1. Create a new GitHub repo and push this folder to it.
2. Repo Settings → Pages → Deploy from branch → `main` / root.
3. Your link: `https://<username>.github.io/<repo-name>/`

**Netlify / Vercel (drag-and-drop, no git needed)**
1. Go to netlify.com (or vercel.com) → New site → drag this folder in.
2. You get an instant `https://...netlify.app` link — can add a custom domain later.

## Updating content

- Copy/results: edit `index.html` directly (each case study is one `<article class="case">` block).
- Colors/fonts: edit the `:root` tokens at the top of `styles.css`.
- CV file: replace `assets/Kristina-Zakharchenko-CV.docx` (keep the same filename, or update the two `href` links in `index.html`).

## Still to add

- Real screenshots (dashboards, ad creatives, results charts) — drop into `assets/` and reference in the relevant `.case` block.
- Once you have a Formspree account (or similar), swap the mailto handler in `script.js` for a real form POST if you want submissions to land in an inbox instead of opening the visitor's email client.
