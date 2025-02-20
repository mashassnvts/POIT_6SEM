/*22. Разработайте приложение 11-05с, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. Приложение вычисляет с помощью RPC-вызовов следующее выражение:
sum(square(3), square(5,4), mul(3,5,7,9,11,13))
+fib(7)
*mul(2,4,6)

Результаты вычислений отобразите в консоли приложения
*/
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4000');

const callRPC = (method, params) => {
    return new Promise((resolve, reject) => {
        ws.send(JSON.stringify({ method, params }));

        const handleMessage = (message) => {
            const response = JSON.parse(message);
            if (response.error) {
                reject(response.error);
            } else {
                resolve(response.result);
            }
            ws.off('message', handleMessage); 
        };

        ws.on('message', handleMessage);
    });
};

ws.on('open', async () => {
    try {
        console.log('connection opened');

        const result = await callRPC('sum', [
            await callRPC('square', [3]),
            await callRPC('square', [5, 4]),
            await callRPC('mul', [3, 5, 7, 9, 11, 13]),
        ]) + (await callRPC('fib', [7])).reduce((acc, val) => acc + val, 0) * await callRPC('mul', [2, 4, 6]);

        console.log('result:', result);
    } catch (error) {
        console.error('error:', error);
    } finally {
        ws.close();
        console.log('connection closed');
    }
});

ws.on('error', (err) => {
    console.error('error:', err);
});
