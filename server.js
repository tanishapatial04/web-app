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
