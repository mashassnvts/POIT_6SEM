const redis = require('redis');
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

(async () => {
    try {
        await client.connect();
        console.log('connected to Redis');

        const numoperations = 10000;

        const measure = async (action) => {
            const start = Date.now();
            for (let i = 1; i <= numoperations; i++) {
                await action(i);
            }
            return Date.now() - start;
        };

        const hsettime = await measure((i) => 
            client.hSet(`hash${i}`, { id: i, val: `val-${i}` })
        );

        const hgettime = await measure((i) => 
            client.hGetAll(`hash${i}`)
        );

        console.log(`hset ${hsettime} ms`);
        console.log(`hget ${hgettime} ms`);

        await client.quit();
    } catch (err) {
        console.error('error', err);
        await client.quit();
    }
})();
