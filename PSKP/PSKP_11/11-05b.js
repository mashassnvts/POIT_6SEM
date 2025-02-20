/*21. Разработайте приложение 11-05b, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. 
Приложение осуществляет параллельный (async/parallel)  RPC-вызовы из п.20.Результаты вычислений отобразите в консоли приложения.
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

ws.on('open', async () => {
    console.log('connection opened');

    const promises = rpcCalls.map((call) => {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9); 

            const handleMessage = (message) => {
                const response = JSON.parse(message);
                if (response.error) {
                    reject(`Error for call ${id}: ${response.error}`);
                } else {
                    resolve({ id, result: response.result });
                }
                ws.off('message', handleMessage); 
            };

            ws.on('message', handleMessage);
            ws.send(JSON.stringify(call));
        });
    });

    try {
        const results = await Promise.all(promises);
        results.forEach(({ id, result }, index) => {
            console.log(`rpc call ${index + 1} result:`, result);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        ws.close();
        console.log('connection closed');
    }
});

ws.on('error', (err) => {
    console.error('error', err);
});
