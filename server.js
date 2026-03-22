const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const PAIRING_BASE = 'https://nexs-session-1.replit.app';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function proxyRequest(targetUrl, res, responseContentType) {
  https.get(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NexusBotProxy/1.0)',
      'Accept': '*/*',
    }
  }, (upstream) => {
    const ct = responseContentType || upstream.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', ct);
    res.writeHead(upstream.statusCode);
    upstream.pipe(res);
  }).on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Pairing service unavailable', details: err.message }));
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Proxy: QR code image ──────────────────────────────────────────────────
  if (pathname === '/api/qr') {
    proxyRequest(`${PAIRING_BASE}/qr`, res, 'image/png');
    return;
  }

  // ── Proxy: Pair code (pass phone number through) ─────────────────────────
  if (pathname === '/api/pair') {
    const number = parsed.query.number || '';
    if (!number) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing phone number' }));
      return;
    }
    // Collect response from upstream, parse code from JSON or HTML
    let body = '';
    https.get(`${PAIRING_BASE}/pair?number=${encodeURIComponent(number)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexusBotProxy/1.0)',
        'Accept': 'application/json, text/html, */*',
      }
    }, (upstream) => {
      upstream.on('data', chunk => body += chunk);
      upstream.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Try to parse as JSON first
        try {
          const json = JSON.parse(body);
          res.writeHead(200);
          res.end(JSON.stringify(json));
        } catch {
          // Try to extract pair code from HTML (common patterns)
          const codeMatch = body.match(/([A-Z0-9]{4}-[A-Z0-9]{4})/);
          if (codeMatch) {
            res.writeHead(200);
            res.end(JSON.stringify({ code: codeMatch[1] }));
          } else {
            // Return raw so frontend can display it
            res.writeHead(200);
            res.end(JSON.stringify({ raw: body.slice(0, 500) }));
          }
        }
      });
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Pairing service unavailable', details: err.message }));
    });
    return;
  }

  // ── Proxy: Status / stats from pairing site ───────────────────────────────
  if (pathname === '/api/status') {
    proxyRequest(`${PAIRING_BASE}/`, res, 'text/html');
    return;
  }

  // ── Serve static files ────────────────────────────────────────────────────
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, data2) => {
          if (err2) { res.writeHead(404); res.end('Not Found'); }
          else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(data2); }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`NexusBot site running at http://${HOST}:${PORT}`);
  console.log(`Pairing proxy active → ${PAIRING_BASE}`);
});
