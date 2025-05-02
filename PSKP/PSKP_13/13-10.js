/*16. Разработайте приложение 13-10, представляющее собой  UDP-клиент, проверяющий  работоспособность сервера 13-09.*/
const udp = require('dgram');
const HOST = 'localhost';
const PORT = 4000;
let client = udp.createSocket('udp4');


let message = process.argv[2] ? process.argv[2] : 'Client message';

client.on('message', msg => {
    console.log(`Received message: ${msg.toString()} (${msg.length} bytes)`);
});

client.send(message, PORT, HOST, error => {
    if (error) {
        console.log('[ERROR] ' + error.message);
        client.close();
    }
    else
        console.log('\nMessage sent to server.');
});

client.on('error', error => {
    console.log('[ERROR] ' + error.message);
    client.close();
});

client.on('close', () => { console.log('Closed'); });