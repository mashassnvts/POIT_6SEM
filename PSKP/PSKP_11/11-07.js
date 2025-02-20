/*30. Разработайте приложение 11-07, представляющий собой WebSocket(WS)-север, прослушивающий порт 4000.
31. Приложение может принимать три типа уведомлений: A, B, C. При получении уведомления, сервер выводит соответствующее сообщение на консоль.
*/
const rpcWSS = require('rpc-websockets').Server;
const server = new rpcWSS({ port: 4000, host: 'localhost' });

server.register('notify', ({ type, message }) => {
    if (['A', 'B', 'C'].includes(type)) {
        console.log(`received notification: ${type} - ${message}`);
        return { result: `Notification ${type}` }; 
    } else {
        return { error: `unknown: ${type}` }; 
    }
});

console.log('websocket server running on ws://localhost:4000');
