/*7. Разработайте приложение 11-02a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. */
const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:4000/wsserver');

ws.on('open', () => {
    console.log('connection established');

    const receiveStream = WebSocket.createWebSocketStream(ws);
    const fileStream = fs.createWriteStream('./exampleee.txt');
    receiveStream.pipe(fileStream);

    fileStream.on('finish', () => {
        console.log('received');
        ws.close();
    });

    fileStream.on('error', (err) => {
        console.error('error', err);
    });
});

ws.on('error', (err) => {
    console.error('error:', err);
});
