# teamdub.com

Landing page for **Team Dub Labs** — an independent software laboratory.

Static site (HTML/CSS/vanilla JS), no build step. Hosted on GitHub Pages,
served at [teamdub.com](https://teamdub.com) via the `CNAME` file.

## Local preview

```sh
python3 -m http.server 4317
# open http://localhost:4317
```

## Files

- `index.html` — markup
- `styles.css` — design tokens + layout
- `main.js` — oscilloscope hero (canvas phosphor trace)
- `CNAME` — custom domain for GitHub Pages
