/*12. Разработайте приложение 11-04, представляющий собой WebSocket(WS)-север, прослушивающий порт 4000.
13. Сервер принимает сообщение вида: 
{client:x, timestamp:t}, где x-имя клиента, а t–штамп времени. Сообщение передается клиентом в json-формате. 
14. Сервер  отправляет  в ответ клиенту сообщение вида: 
{server: n  client:x, timestamp:t}, где n –номер сообщения, x-имя клиента, а t–штамп времени. Сообщение передается сервером в json-формате
*/
const WebSocket = require('ws');

const wsserver = new WebSocket.Server({ port: 4000, host: 'localhost', path: '/wsserver' });
let mes = 0; 
wsserver.on('connection', (ws) => {
    console.log('new websocket connection');
    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log('received from client:', parsedMessage);

            const response = {
                server: ++mes,
                client: parsedMessage.client,
                timestamp: new Date().toISOString(),
            };
            ws.send(JSON.stringify(response));
            console.log('sent to client:', response);
        } catch (err) {
            console.error('erro:', err);
            ws.send(JSON.stringify({ error: 'invalid  format' }));
        }
    });

    ws.on('close', () => {
        console.log('client disconnected');
    });

    ws.on('error', (err) => {
        console.error('websocket error:', err);
    });
});

console.log('websocket server running on ws://localhost:4000/wsserver');
