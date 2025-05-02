const redis = require('redis');
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

client.on('connect', () => { console.log('connected to redis'); });
client.on('error', (err) => { console.log('error', err); });
client.on('end', () => { console.log('disconnected from redis'); });
client.on('ready', () => { console.log('redis is ready'); });

client.connect()
.then(() => {
    client.quit();
})
.catch((err => console.log(err)))