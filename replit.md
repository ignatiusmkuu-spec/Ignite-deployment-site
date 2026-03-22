# NexusBot — Intelligent Deployment Automation Website

A complete, polished marketing website for NexusBot, a deployment automation bot/platform.

## Project Structure

- `server.js` — Node.js HTTP server serving static files on port 5000
- `public/index.html` — Full single-page website with all sections
- `public/style.css` — Complete CSS (dark theme, responsive, animations)
- `public/app.js` — Interactive JavaScript (nav, tabs, billing toggle, forms, scroll animations)

## Website Sections

1. **Navbar** — Sticky, scrolled blur effect, mobile hamburger menu
2. **Hero** — Animated terminal, live status card, stats
3. **Trusted By** — Logo strip
4. **Features** — 6-card grid with icons and tags
5. **How It Works** — 4-step process
6. **Commands** — Tabbed CLI reference (Deploy, Rollback, Scale, Logs, Secrets)
7. **Integrations** — 12 integrations grid
8. **Pricing** — 3 plans with monthly/annual toggle
9. **Testimonials** — 3 customer quotes
10. **Docs** — Quick-start cards + install command copy button
11. **CTA / Get Started** — Email signup
12. **Contact** — Contact form with category selector
13. **Footer** — Brand, links, social

## Running

No npm dependencies. Uses Node.js built-in `http` module.

```
node server.js
```

Starts on `0.0.0.0:5000`.

## Architecture

- Pure static site (HTML/CSS/JS), no build step, no framework
- Server: Node.js built-in `http` module
- Port: 5000 (webview workflow)
- Host: 0.0.0.0 (Replit proxy compatible)
