const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.text());

import('webdav').then(webdav => {
    const { createClient } = webdav;

    const client = createClient('https://webdav.yandex.ru', {
        username: 'sosnovetsm@yandex.com',
        password: 'odkxwxzdihppcsfw',
    });

    const send408 = (res, msg) => res.status(408).send(msg);
    const send404 = (res, msg) => res.status(404).send(msg);

    app.post('/md/:name', async (req, res) => {
        const dir = '/' + req.params.name;
        if (await client.exists(dir)) return send408(res, `Failed to create folder: ${dir}`);
        await client.createDirectory(dir);
        res.send('Directory created.');
    });

    app.post('/rd/:name', async (req, res) => {
        const dir = '/' + req.params.name;
        if (!await client.exists(dir)) return send404(res, `No directory: ${dir}`);
        await client.deleteFile(dir);
        res.send('Directory deleted.');
    });

    app.post('/up/:name', async (req, res) => {
        try {
            if (!req.body) return send404(res, 'No content.');
            const temp = `temp_${Date.now()}_${req.params.name}`;
            fs.writeFileSync(temp, req.body);
            const rs = fs.createReadStream(temp);
            const ws = client.createWriteStream('/' + req.params.name);
            rs.pipe(ws);
            rs.on('end', () => fs.unlinkSync(temp));
            res.send('File uploaded.');
        } catch (e) {
            send408(res, 'Upload error: ' + e.message);
        }
    });

    app.post('/down/:name', async (req, res) => {
        const file = '/' + req.params.name;
        if (!await client.exists(file)) return send404(res, `No file: ${file}`);
        const rs = client.createReadStream(file);
        rs.pipe(res);
    });

    app.post('/del/:name', async (req, res) => {
        const file = '/' + req.params.name;
        if (!await client.exists(file)) return send404(res, `No file: ${file}`);
        await client.deleteFile(file);
        res.send('File deleted.');
    });

    app.post('/copy/:from/:to', async (req, res) => {
        const from = '/' + req.params.from;
        const to = '/' + req.params.to;
        if (!await client.exists(from)) return send404(res, `No file: ${from}`);
        try {
            await client.copyFile(from, to);
            res.send('File copied.');
        } catch (e) {
            send408(res, 'Copy error: ' + e.message);
        }
    });

    app.post('/move/:from/:to', async (req, res) => {
        const from = '/' + req.params.from;
        const to = '/' + req.params.to;
        if (!await client.exists(from)) return send404(res, `No file: ${from}`);
        try {
            await client.moveFile(from, to);
            res.send('File moved.');
        } catch (e) {
            send408(res, 'Move error: ' + e.message);
        }
    });

    app.listen(port, () => console.log(`Server running at localhost:${port}/`));
}).catch(err => console.error('WebDAV:', err.message));