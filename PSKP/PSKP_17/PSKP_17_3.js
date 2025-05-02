const redis = require('redis');
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

(async () => {
    try {
        await client.connect();
        console.log('connected to redis');

        const key = 'key';
        const numoperations = 10000;

        await client.set(key, 0);

        const measure = async (operation,  action) => {
            const start = Date.now();
            for (let i = 0; i < numoperations; i++) {
                await action(i);
            }
            return Date.now() - start;
        };

        const incrtime = await measure('incr', () => client.incr(key));
        const decrtime = await measure('decr', () => client.decr(key));

        console.log(`incr ${incrtime} ms`);
        console.log(`decr ${decrtime} ms`);

        await client.quit();
    }
    catch (err) { console.log('error',err);
        await client.quit();
    }
})();
