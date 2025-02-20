/*28. Разработайте приложение 11-06c, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. 
Приложение подписывается на событие C и сообщает о наступлении этого события выводом на консоль. 
29. Продемонстрируйте совместную работу всех четырех приложений. 
*/
const rpcWSC = require('rpc-websockets').Client;
const client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {
    console.log('connected to server');

    client.subscribe('C');
    client.on('C', () => {
        console.log('event C');
    });
});

client.on('error', (err) => {
    console.error('error:', err);
});
