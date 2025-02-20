/*1. Разработайте приложение 11-01, представляющий собой WebSocket(WS)-север, прослушивающий порт 4000.
2. WS-сервер предназначен для приема по ws-каналу файлов. 
3. Принятый по ws-каналу файл переписывается в  директорий upload. 
*/
let http = require('http');
let fs = require('fs');
const WebSocket = require('ws');

const wsServer = new WebSocket.Server({port:4000, host: 'localhost', path: '/wsserver'});
let k = 0;
if (!fs.existsSync('./upload')) {
    fs.mkdirSync('./upload');
  }
wsServer.on('connection', (ws) =>{
    console.log('new websocket connection');

    const socketStream = WebSocket.createWebSocketStream(ws);
    const fileStream = fs.createWriteStream(`./upload/example${++k}.txt`);

    socketStream.pipe(fileStream);

    fileStream.on('finish', ()=>{
        console.log('loaded');
    });

    fileStream.on('error', (err)=>{
        console.log('error', err);
    });

});
wsServer.on('error', (err)=>{
    console.log('error', err);
});
console.log(`websocket server running on ws://localhost:4000`);