/*5. Разработайте приложение 11-02, представляющий собой WebSocket(WS)-север, прослушивающий порт 4000.
6. WS-сервер предназначен для  отправки  по ws-каналу файлов из директория download. 
*/
let fs = require('fs');
const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ port: 4000, host: 'localhost', path: '/wsserver' });

if (!fs.existsSync('./download')) {
    fs.mkdirSync('./download'); 
}

wsServer.on('connection', (ws) => {
    console.log('websocket connection');
    const fileToSend = './download/example.txt'; 

    if (fs.existsSync(fileToSend)) {
        const fileStream = fs.createReadStream(fileToSend);
        const socketStream = WebSocket.createWebSocketStream(ws);

        fileStream.pipe(socketStream);

        fileStream.on('end', () => {
            console.log('sent');
            ws.close(); 
        });

        fileStream.on('error', (err) => {
            console.error('error', err);
        });
    } else {
        console.error('not exist:', fileToSend);
        ws.close();
    }
});

wsServer.on('error', (err) => {
    console.error('error:', err);
});

console.log('websocket server running on ws://localhost:4000/wsserver');
