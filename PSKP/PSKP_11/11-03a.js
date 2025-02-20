/*11. Разработайте приложение 11-03a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. 
Продемонстрируйте работу сервера с несколькими экземплярами 11-03a.*/
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
    console.log('connected');
});

ws.on('message', (message) => {
    console.log(`received: ${message}`)
});

ws.on('ping', () => {
    console.log('ping received from server');
    ws.pong();
});

ws.on('close', () => {
    console.log('connection closed by server');
});

ws.on('error', (err) => {
    console.error('websocket error:', err);
});
