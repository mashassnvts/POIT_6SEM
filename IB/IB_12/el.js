const bigInt = require('big-integer');
const crypto = require('crypto');

function generatePG(bits = 128) {
    const p = bigInt('170141183460469231731687303715884105727'); 
    const g = bigInt(3); 
    return { p, g };
}

function generateKeys(bits = 256) {
    const { p, g } = generatePG(bits);
    const x = bigInt.randBetween(2, p.minus(2));
    const y = g.modPow(x, p);
    return { p, g, y, x };
}

function hashMessage(message) {
    const hash = crypto.createHash('sha256').update(message).digest('hex');
    return bigInt(hash, 16);
}

function sign(message, keys) {
    const { p, g, x } = keys;
    const h = hashMessage(message).mod(p.minus(1));
    let k;
    do {
        k = bigInt.randBetween(2, p.minus(2));
    } while (bigInt.gcd(k, p.minus(1)).notEquals(1));
    const a = g.modPow(k, p);
    const kInv = k.modInv(p.minus(1));
    const b = kInv.multiply(h.minus(x.multiply(a))).mod(p.minus(1));
    return { a: a.toString(), b: b.toString() };
}

function verify(message, signature, keys) {
    const { p, g, y } = keys;
    const { a, b } = signature;
    const h = hashMessage(message).mod(p.minus(1));
    const left = y.modPow(bigInt(a), p).multiply(bigInt(a).modPow(bigInt(b), p)).mod(p);
    const right = g.modPow(h, p);
    return left.equals(right);
}

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


if (require.main === module) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const { timed, generateKeys, sign, verify } = module.exports;
    const { result: keys, ms: keygenTime } = timed(generateKeys, 128);

    console.log("Ключи сгенерированы за", keygenTime.toFixed(2), "мс");
    console.log("Открытый ключ (p, g, y):", keys.p.toString(), keys.g.toString(), keys.y.toString());
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
