/*32. Разработайте приложение 11-07a, представляющий собой WS-клиент, демонстрирующий работоспособность сервера. 
Приложение шлет уведомления серверу при получении соответствующего сообщения через стандартный ввод (консоль).    */
const rpcWSC = require('rpc-websockets').Client;
let ws = new rpcWSC('ws://localhost:4000');

process.stdin.setEncoding('utf-8');
process.stdin.on('readable', () => {
    let chunk = process.stdin.read();
    if (chunk) {
        let input = chunk.trim();
        if (input === 'A' || input === 'B' || input === 'C') {
            ws.call('notify', { type: input, message: `message${input}` })
                .then(() => console.log(`notification ${input} sent`))
                .catch(err => console.error('error:', err));
        }
    }
});
ws.on('open', () => {
    console.log('connected to the server');
});
