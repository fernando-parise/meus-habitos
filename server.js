const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const DATA_FILE = path.join(DIR, 'habitos.json');
const PORT = 3000;

// Garante que o arquivo existe
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ project_start: '', usage_start: '', days: {} }, null, 2));
}

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  // CORS para dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API - ler dados
  if (req.method === 'GET' && req.url === '/api/data') {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(raw);
    return;
  }

  // API - salvar dados
  if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        JSON.parse(body); // valida JSON
        fs.writeFileSync(DATA_FILE, body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end('{"error":"JSON invalido"}');
      }
    });
    return;
  }

  // Servir arquivos estaticos
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(DIR, filePath);
  const ext = path.extname(filePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('404');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Habitos rodando em http://localhost:${PORT}`);
  console.log(`Na rede local: http://${getLocalIP()}:${PORT}`);
  console.log(`Dados em: ${DATA_FILE}`);
});

function getLocalIP() {
  const nets = require('os').networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
