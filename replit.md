# Ignite Deployment Site

A static marketing/landing site for "Ignite" — a deployment platform brand.

## Project Structure

- `server.js` — Node.js HTTP server serving static files on port 5000
- `public/index.html` — Main HTML page
- `public/style.css` — Styles (dark theme, responsive)
- `public/app.js` — Minimal client-side JS (contact form handler)

## Running

The app is served via a built-in Node.js `http` server (no npm dependencies needed).

```
node server.js
```

Starts on `0.0.0.0:5000`.

## Architecture

- Pure static site (HTML/CSS/JS), no build step, no framework
- Server: Node.js built-in `http` module
- Port: 5000 (webview workflow)
- Host: 0.0.0.0 (Replit proxy compatible)
