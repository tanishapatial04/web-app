const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000; // Must be 3000 to match proxy target
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function sanitize(filePath) {
  const resolved = path.normalize(filePath).replace(/^\/+/, '');
  if (resolved.includes('..')) return 'index.html';
  return resolved;
}

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(status, { 'Content-Type': type });
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => send404(res));
  stream.pipe(res);
}

function send404(res) {
  const notFound = path.join(PUBLIC_DIR, '404.html');
  if (fs.existsSync(notFound)) return sendFile(res, notFound, 404);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('404 Not Found');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname || '/';

  // Proxy endpoint for tracking to keep Supabase key server-side
  if (pathname === '/track' && req.method === 'POST') {
    // Ensure we have a Supabase function URL and key in env
    const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL || 'https://rcyktxwlfrlhxgsxxahr.supabase.co/functions/v1/track';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
    if (!SUPABASE_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
      return res.end(JSON.stringify({ error: 'Supabase key not configured on server' }));
    }

    // Collect body
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      // Forward to Supabase function
      const dest = url.parse(SUPABASE_FUNCTION_URL);
      const https = require(dest.protocol === 'https:' ? 'https' : 'http');
      const options = {
        hostname: dest.hostname,
        port: dest.port || (dest.protocol === 'https:' ? 443 : 80),
        path: dest.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'apikey': SUPABASE_KEY
        }
      };

      const proxyReq = https.request(options, proxyRes => {
        let respBody = '';
        proxyRes.on('data', d => { respBody += d; });
        proxyRes.on('end', () => {
          // Mirror status and headers (simplified)
          res.writeHead(proxyRes.statusCode || 200, { 'Content-Type': proxyRes.headers['content-type'] || 'application/json' });
          res.end(respBody);
        });
      });

      proxyReq.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'Proxy request failed', details: err.message }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });

    return;
  }

  if (pathname.startsWith('/blog/')) {
    const blogPage = path.join(PUBLIC_DIR, 'blog-single.html');
    if (fs.existsSync(blogPage)) return sendFile(res, blogPage);
  }
  
  if (pathname === '/') pathname = '/index.html';

  const safePath = sanitize(pathname);
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) return send404(res);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) return send404(res);
    sendFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
