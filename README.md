# teamdub.com

Public site for **Team Dub Labs Ltd**, an AI, automation, and custom software
consultancy in Regina, SK. Static multi-page site hosted on **GitHub Pages**
at [teamdub.com](https://teamdub.com).

## Pages

| File | Purpose |
|---|---|
| `index.html` | Homepage: services, how-we-work funnel, bio, contact |
| `training.html` | Intro to AI training offer: agenda, dates, pricing |
| `okf-operational-layer.html` | Long-form article on the OKF operational layer |
| `404.html` | Not-found page (served automatically by GitHub Pages) |

There is no build step, no framework, and no CI. Each page carries its own
inline `<style>` on purpose, so pages stay independent; the only shared CSS
is `assets/tokens.css` (brand tokens, reset, header pattern) and
`assets/fonts.css` (self-hosted font faces).

## Local preview

Any static file server works:

```bash
python3 -m http.server 4317
```

Then open <http://localhost:4317>.

## Deployment

Pushing to `main` deploys immediately via GitHub Pages. What is in the repo
is what is on the site.

- `CNAME` holds the custom domain (`teamdub.com`). Do not delete it, or
  Pages drops the domain binding.
- `.nojekyll` disables GitHub's Jekyll pipeline so files are served exactly
  as committed. Keep it.

## Making changes

- **Training dates and price** live in `training.html` (the `#dates` panel:
  two booking `mailto:` links with `<time>` elements, and the price note)
  and are echoed in the "AI Training, in person" callout on `index.html`.
  Update both together.
- **Sitemap**: when a page is added or meaningfully changed, update
  `sitemap.xml` (`lastmod`, plus a new `<url>` entry for new pages).
- **Canonical/OG URLs** point at `https://teamdub.com/…`; keep them in sync
  when adding pages.
- The homepage funnel diagram is two SVGs (landscape and portrait, swapped
  at 560px); content changes must be made in both.

## Validation

No automated checks yet; before pushing, these are useful:

```bash
npx html-validate index.html training.html okf-operational-layer.html 404.html
```

```bash
npx linkinator http://localhost:4317 --recurse
```

## Fonts

Zen Dots (display), Archivo (headers), and Inter (body) are self-hosted
WOFF2 subsets in `assets/fonts/`, so the site makes no third-party requests
at runtime. All three are licensed under the SIL Open Font License 1.1;
licence and copyright texts are in `assets/fonts/OFL-*.txt`.
