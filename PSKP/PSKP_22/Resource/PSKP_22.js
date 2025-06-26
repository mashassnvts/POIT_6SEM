const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

const options = {
    key: fs.readFileSync('resource.key'),
    cert: fs.readFileSync('resource.crt')
};

app.get('/', (req, res) => {
    res.send('Hello, this is a secure HTTPS server!');
});

https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on https://LAB22-SMI');
});