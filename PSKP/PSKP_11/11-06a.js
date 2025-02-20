/*26. Разработайте приложение 11-06a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. 
Приложение подписывается на событие A и сообщает о наступлении этого события выводом на консоль. */
const rpcWSC = require('rpc-websockets').Client;
const client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {
    console.log('connected');

    client.subscribe('A');
    client.on('A', () => {
        console.log('event A');
    });
});

client.on('error', (err) => {
    console.error('error:', err);
});
