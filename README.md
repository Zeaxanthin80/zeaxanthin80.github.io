# zeaxanthin80.github.io

Modern, minimal personal GitHub Pages portfolio for **@Zeaxanthin80**.

## What it includes

- Cutting-edge minimalist UI
- Live repository highlights from GitHub
- Tech stack summary inferred from repo languages
- Optional modest backend (`/api/github-summary`) for Vercel deployment

## Local preview

```bash
cd /home/runner/work/zeaxanthin80.github.io/zeaxanthin80.github.io
python -m http.server 4173
```

Open `http://localhost:4173`.

## Optional Vercel backend

This repo includes a serverless function at `api/github-summary.js`.

- On Vercel, the frontend will use `/api/github-summary`.
- On GitHub Pages, the frontend automatically falls back to the GitHub REST API.
