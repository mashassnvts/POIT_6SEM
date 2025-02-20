/*4. Разработайте приложение 11-01a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. */
let fs = require('fs');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000/wsserver');

ws.on('open', ()=>{
    console.log('connection established');

    const sendStream = WebSocket.createWebSocketStream(ws);
    const filetosend = fs.createReadStream(`./example.txt`);

    filetosend.pipe(sendStream);

    filetosend.on('end', ()=>{
        console.log('file send');
        ws.close();
    });
});

ws.on('error', (err) =>{
    console.error('error', err);
});