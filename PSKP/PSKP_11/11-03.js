/*8. Разработайте приложение 11-03, представляющий собой WebSocket(WS)-север, прослушивающий порт 4000.
9. Сервер всем подключившимся клиентам каждые 15 секунд высылает сообщение следующего формата 11-03-server: n, где n - последовательный номер отправляемого сервером сообщения.
10. С помощью ping/pong-механизма сервер проверяет работоспособность соединений, каждые 5 секунд, при этом сервер выводит в консоль  количество работоспособных соединений.    
*/
const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ port: 4000 });

let messageCount = 0;

wsServer.on('connection', (ws) => {
    console.log('new websocket connection');

    const messageInterval = setInterval(() => {
        const message = `11-03-server: ${++messageCount}`;
        ws.send(message);
        console.log(`sent: ${message}`);
    }, 15000);

    ws.on('pong', () => {
        ws.isAlive = true; 
    });

    ws.on('close', () => {
        console.log('disconnected');
        clearInterval(messageInterval); 
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });

    ws.isAlive = true; 
});

setInterval(() => {
    wsServer.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log('terminating inactive connection');
            return ws.terminate(); 
        }
        ws.isAlive = false; 
        ws.ping();
    });

    const activeConnections = [...wsServer.clients].filter((ws) => ws.readyState === WebSocket.OPEN).length;
    console.log(`active: ${activeConnections}`);
}, 5000);

console.log('websocket server running on ws://localhost:4000');
