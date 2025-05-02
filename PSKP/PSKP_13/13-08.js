/*13. Разработайте клиент 13-08, представляющее собой TCP-клиент. Клиент принимает 1 числовой параметр (номер порта) командную строку.  
Клиент через TCP-соединение оправляет 1 раз в секунду серверу 32-битовые  числа X. Клиент принимает от сервера сообщения и выводит их 
на консоль. */
const net = require('net');
const HOST = '127.0.0.1';
const PORT = process.argv[2] ? process.argv[2] : 4000;
let number =
    process.argv[3] && Number.isInteger(+process.argv[3].toString().trim())
        ? +process.argv[3]
        : 1;
let client = new net.Socket();
let buffer = new Buffer.alloc(4);

setTimeout(() => {
    client.connect(PORT, HOST, () => {
        console.log(
            `\nServer:  ${client.remoteAddress}:${client.remotePort}\nPORT:    ${PORT}\nNUMBER:  ${number}\n`
        );

        let intervalWriteNumber = setInterval(() => {
            client.write((buffer.writeInt32LE(number, 0), buffer));
        }, 1000);

        setTimeout(() => {
            clearInterval(intervalWriteNumber);
            client.end();
        }, 21000);
    });

    client.on('data', (data) => {
        console.log(`[${PORT}] Client received: ${data}`);
    });
    client.on('close', () => {
        console.log(`[${PORT}] Connection closed.`);
    });
    client.on('error', (error) => {
        console.log('[ERROR] ' + error.message);
    });
}, 500);
