/*19. Разработайте приложение 11-05a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. Приложение осуществляет следующие RPC-вызовы:
square(3), square(5,4), 
sum(2), sum(2,4,6,8,10), 
mul(3), mul(3,5,7,9,11,13),
fib(1), fib(2), fib(7),
fact(0), fact(5), fact(10)
*/
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000');

const rpcCalls = [
    { method: 'square', params: [3] },
    { method: 'square', params: [5, 4] },
    { method: 'sum', params: [2] },
    { method: 'sum', params: [2, 4, 6, 8, 10] },
    { method: 'mul', params: [3] },
    { method: 'mul', params: [3, 5, 7, 9, 11, 13] },
    { method: 'fib', params: [1] },
    { method: 'fib', params: [2] },
    { method: 'fib', params: [7] },
    { method: 'fact', params: [0] },
    { method: 'fact', params: [5] },
    { method: 'fact', params: [10] },
];

ws.on('open', () => {
    rpcCalls.forEach((call) => {
        ws.send(JSON.stringify(call));
    });
});

ws.on('message', (message) => {
    const response = JSON.parse(message);
    if (response.error) {
        console.error('error:', response.error);
    } else {
        console.log('result:', response.result);
    }
});
