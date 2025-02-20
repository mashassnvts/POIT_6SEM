/*15. Разработайте приложение 11-04a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. Приложение принимает параметр командной строки, значение которого используется в качестве значения x, в сообщении для сервера.
16. Продемонстрируйте взаимодействие сервера с несколькими клиентами (клиенты должны иметь разные значения параметра).
*/
const WebSocket = require('ws');
const parm2 = process.argv[2];
if (!parm2) {
    console.error('no arguments');
    process.exit(1);
}

const ws = new WebSocket('ws://localhost:4000/wsserver');

ws.on('open', () => {
    console.log(`Connected to server as "${parm2}"`);

    ws.on('message', (data) => {
        try {
            const response = JSON.parse(data);
            console.log('received from server:', response);
        } catch (err) {
            console.error('invalid  format:', data);
        }
    });

    setInterval(() => {
        const message = {
            client: parm2,
            timestamp: new Date().toISOString(),
        };
        ws.send(JSON.stringify(message));
        console.log('sent to server:', message);
    }, 10000);
});

ws.on('error', (err) => {
    console.error('error:', err);
});

ws.on('close', () => {
    console.log('connection closed');
});
