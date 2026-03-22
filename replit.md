# NexusBot — Intelligent Deployment Automation Website

A complete, polished marketing website for NexusBot, a WhatsApp deployment automation platform.

## Project Structure

- `server.js` — Node.js HTTP server on port 5000; proxies `/api/pair` and `/api/qr` to nexs-session-1.replit.app
- `public/index.html` — Full single-page website with all sections + modals
- `public/style.css` — Complete CSS (dark theme, responsive, animations, M-Pesa modal)
- `public/app.js` — Interactive JS (nav, tabs, pairing, deploy flow, M-Pesa payment)

## Website Sections

1. **Navbar** — Sticky, scrolled blur effect, mobile hamburger, Deploy Now CTA
2. **Hero** — Animated terminal, live status card, stats
3. **Trusted By** — Logo strip
4. **Features** — 6-card grid with icons and tags
5. **How It Works** — 4-step process
6. **Commands** — Tabbed CLI reference (Deploy, Rollback, Scale, Logs, Secrets)
7. **Integrations** — 12 integrations grid
8. **Pricing** — KSH 50 first month / KSH 100/month ongoing; M-Pesa STK push payments
9. **Testimonials** — 3 customer quotes
10. **Docs** — Quick-start cards + install command copy button
11. **Connect Bot** — WhatsApp pairing via pair code or QR code (proxied to NEXUS-MD)
12. **Control Panel** — Session ID generator, admin phone manager, deploy card
13. **CTA / Get Started** — Email signup
14. **Contact** — Contact form
15. **Footer** — Brand, links, social

## Modals

- **Deploy Modal** — Animated multi-step deployment log simulation
- **M-Pesa Modal** — Real M-Pesa STK push flow: phone entry → STK push → polling → success/error states

## M-Pesa Payment Integration

- **STK Push**: `POST https://mpesapi.giftedtech.co.ke/api/payNexusTech.php`
- **Polling**: `POST https://mpesapi.giftedtech.co.ke/api/verify-transaction.php` (every 2s)
- Handles: success, pending, cancelled, insufficient_funds, timeout states
- Phone auto-formatted to `2547XXXXXXXX` or `2541XXXXXXXX`

## WhatsApp Bot Integration

- **Pair Code**: `/api/pair?number=254XXXXXXXXX` → proxied to nexs-session-1.replit.app
- **QR Code**: `/api/qr` → proxied PNG image from nexs-session-1.replit.app

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
