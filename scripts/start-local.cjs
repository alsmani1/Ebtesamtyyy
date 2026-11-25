const http = require('http');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'out');
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let rawUrl = req.url.split('?')[0];
  let urlPath;
  try {
    urlPath = decodeURIComponent(rawUrl);
  } catch (_) {
    urlPath = rawUrl;
  }

  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  let filePath = path.join(outDir, urlPath);

  // If directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  }

  // 404 Fallback
  if (!fs.existsSync(filePath)) {
    filePath = path.join(outDir, '404.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error loading ' + urlPath);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  EBTESAMTY STATIC EDITION IS LIVE!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  Network URL: http://127.0.0.1:${PORT}`);
  console.log(`  Demo Switch: http://localhost:${PORT}/demo/`);
  console.log(`======================================================\n`);
});
