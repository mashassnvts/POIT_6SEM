/*23. Разработайте приложение 11-06, представляющий собой WebSocket(WS)-север, прослушивающий порт 4000.
24. Приложение может генерировать три события: A, B, C.
25. Генерация событий осуществляется, при получении соответствующего сообщения через стандартный поток ввода (через консоль). При ввода символа A, сервер генерирует событие A; при ввода символа B, сервер генерирует событие B; при ввода символа C, сервер генерирует событие C.  
*/
const readline = require('readline');
const rpcWSS = require('rpc-websockets').Server;
const config = { port: 4000, host: 'localhost', path: '/' };
const server = new rpcWSS(config);

server.event('A');
server.event('B');
server.event('C');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

console.log('A, B, C');
rl.on('line', (line) => {
    if (['A', 'B', 'C'].includes(line)) {
        server.emit(line);
        console.log(`Event ${line} `);
    } else {
        console.log('Invalid event');
    }
});
