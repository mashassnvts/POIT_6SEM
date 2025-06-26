const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/hash' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const startTime = process.hrtime();
            const hash = crypto.createHash('sha256').update(body).digest('hex');
            const endTime = process.hrtime(startTime);
            const timeTaken = endTime[0] * 1e3 + endTime[1] / 1e6;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ hash, timeTaken }));
        });
    } else if (req.url === '/test-hash' && req.method === 'POST') {
        let inputLengths = [10, 100, 1000, 10000, 100000];
        let results = [];

        Promise.all(inputLengths.map(length => {
            const inputText = 'a'.repeat(length);
            return new Promise((resolve) => {
                const startTime = process.hrtime();
                crypto.createHash('sha256').update(inputText).digest('hex');
                const endTime = process.hrtime(startTime);
                const timeTaken = endTime[0] * 1e3 + endTime[1] / 1e6;
                results.push({ length, timeTaken });
                resolve();
            });
        })).then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});