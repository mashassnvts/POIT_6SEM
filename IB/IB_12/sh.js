const bigInt = require('big-integer');
const crypto = require('crypto');

const p = bigInt('467'); // простое
const q = bigInt('233'); // простое, делит p-1 (466/233=2)
const g = bigInt('2');   // 2^233 mod 467 == 1

function generateKeys() {
    const x = bigInt.randBetween(1, q.minus(1)); 
    const y = g.modPow(x, p); 
    return { p, q, g, x, y };
}

// Хеширование (SHA-256 -> bigInt)
function hashMessage(message) {
    const hash = crypto.createHash('sha256').update(message).digest('hex');
    return bigInt(hash, 16);
}

function sign(message, keys) {
    const { p, q, g, x } = keys;
    let k;
    do {
        k = bigInt.randBetween(1, q.minus(1));
    } while (k.isZero());
    const a = g.modPow(k, p);
    const h = hashMessage(message + a.toString()).mod(q);
    const b = k.add(x.multiply(h)).mod(q);
    return { h: h.toString(), b: b.toString(), a: a.toString(), k: k.toString() };
}

function verify(message, signature, keys) {
    const { p, q, g, y } = keys;
    const { h, b } = signature;
    const y_inv_h = y.modPow(q.minus(bigInt(h)), p); 
    const X = g.modPow(bigInt(b), p).multiply(y_inv_h).mod(p);
    const h2 = hashMessage(message + X.toString()).mod(q);
    console.log("X:", X.toString());
    console.log("h:", h, "h2:", h2.toString());
    return h2.equals(bigInt(h));
}

// С замером времени
function timed(fn, ...args) {
    const start = process.hrtime();
    const result = fn(...args);
    const end = process.hrtime(start);
    const ms = end[0] * 1000 + end[1] / 1e6;
    return { result, ms };
}

module.exports = {
    generateKeys,
    sign,
    verify,
    timed
};

// Тестовый пример
if (require.main === module) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const { timed, generateKeys, sign, verify } = module.exports;
    const { result: keys, ms: keygenTime } = timed(generateKeys);

    console.log("Ключи сгенерированы за", keygenTime.toFixed(2), "мс");
    console.log("Открытый ключ (p, q, g, y):", keys.p.toString(), keys.q.toString(), keys.g.toString(), keys.y.toString());
    console.log("Закрытый ключ (x):", keys.x.toString());

    readline.question("Введите сообщение для подписи: ", (message) => {
        const { result: signature, ms: signTime } = timed(sign, message, keys);
        console.log("Подпись создана за", signTime.toFixed(2), "мс");
        console.log("Подпись:", signature);

        const { result: isValid, ms: verifyTime } = timed(verify, message, signature, keys);
        console.log("Проверка подписи:", isValid ? "Да, подпись верна" : "Нет, подпись неверна");
        console.log("Проверка заняла", verifyTime.toFixed(2), "мс");
        readline.close();
    });
}
