/*27. Разработайте приложение 11-06b, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. 
Приложение подписывается на событие B и сообщает о наступлении этого события выводом на консоль. */
const rpcWSC = require('rpc-websockets').Client
const client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {
    console.log('connected to server');

    client.subscribe('B');
    client.on('B', () => {
        console.log('event B');
    });
});

client.on('error', (err) => {
    console.error('error:', err);
});
