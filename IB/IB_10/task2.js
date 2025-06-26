const forge = require('node-forge');
const { performance } = require('perf_hooks');

const text = "sosnovetsmariaigorevna";
const asciiArray = Array.from(text).map(char => char.charCodeAt(0));

function rsaEncryptDecrypt() {
    const startTime = performance.now();
    
    const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    const data = Buffer.from(text, 'utf8');
    const maxBlockSize = 245;
    let encryptedData = Buffer.alloc(0);

    for (let i = 0; i < data.length; i += maxBlockSize) {
        const block = data.slice(i, Math.min(i + maxBlockSize, data.length));
        const buffer = forge.util.createBuffer(block.toString('binary'), 'binary');
        const encrypted = publicKey.encrypt(buffer.getBytes());
        encryptedData = Buffer.concat([encryptedData, Buffer.from(encrypted, 'binary')]);
    }

    let decryptedData = Buffer.alloc(0);
    const encryptedBlocks = [];
    for (let i = 0; i < encryptedData.length; i += 256) {
        const block = encryptedData.slice(i, i + 256);
        if (block.length === 256) {
            encryptedBlocks.push(block.toString('binary'));
        }
    }
    for (let encryptedBlock of encryptedBlocks) {
        const decrypted = privateKey.decrypt(encryptedBlock);
        decryptedData = Buffer.concat([decryptedData, Buffer.from(decrypted, 'binary')]);
    }

    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    console.log("RSA Encrypted (Base64):", Buffer.from(encryptedData).toString('base64'));
    console.log("RSA Decrypted:", Buffer.from(decryptedData).toString('utf8').slice(0, text.length));
    console.log("RSA Time taken:", timeTaken.toFixed(2), "ms");
}

function elGamalEncryptDecrypt() {
    const startTime = performance.now();

    try {
        const p = new forge.jsbn.BigInteger(forge.random.getBytesSync(64), 16); 
        const pBigInt = p;

        const g = new forge.jsbn.BigInteger('5');

        const a = new forge.jsbn.BigInteger(forge.random.getBytesSync(32), 16)
            .mod(pBigInt.subtract(forge.jsbn.BigInteger.ONE))
            .add(forge.jsbn.BigInteger.ONE);

        const A = g.modPow(a, pBigInt);

        const blockSize = 2; 
        const encryptedBlocks = [];

        for (let i = 0; i < asciiArray.length; i += blockSize) {
            let m = new forge.jsbn.BigInteger('0');
            for (let j = 0; j < blockSize && i + j < asciiArray.length; j++) {
                m = m.multiply(new forge.jsbn.BigInteger('256'))
                    .add(new forge.jsbn.BigInteger(asciiArray[i + j].toString()));
            }

            const k = new forge.jsbn.BigInteger(forge.random.getBytesSync(32), 16)
                .mod(pBigInt.subtract(forge.jsbn.BigInteger.ONE))
                .add(forge.jsbn.BigInteger.ONE);

            const c1 = g.modPow(k, pBigInt);
            const A_k = A.modPow(k, pBigInt);
            const c2 = m.multiply(A_k).mod(pBigInt);

            encryptedBlocks.push({ c1, c2 });
        }

        let decryptedText = '';
        for (let block of encryptedBlocks) {
            const s = block.c1.modPow(a, pBigInt);
            const sInv = s.modInverse(pBigInt);
            const m = block.c2.multiply(sInv).mod(pBigInt);

            let bytes = [];
            let temp = m;
            while (temp.compareTo(forge.jsbn.BigInteger.ZERO) > 0) {
                const byte = temp.mod(new forge.jsbn.BigInteger('256'));
                bytes.unshift(byte.intValue());
                temp = temp.divide(new forge.jsbn.BigInteger('256'));
            }

            while (bytes.length < blockSize && bytes.length + decryptedText.length < text.length) {
                bytes.unshift(0);
            }

            for (let byte of bytes) {
                if (decryptedText.length < text.length) {
                    decryptedText += String.fromCharCode(byte);
                }
            }
        }

        const endTime = performance.now();
        const timeTaken = endTime - startTime;

        let encryptedBytes = [];
        for (let block of encryptedBlocks) {
            const c1Bytes = block.c1.toByteArray();
            const c2Bytes = block.c2.toByteArray();
            encryptedBytes.push(...c1Bytes, ...c2Bytes);
        }
        const encryptedBase64 = Buffer.from(encryptedBytes).toString('base64');

        console.log("ElGamal Encrypted (Base64):", encryptedBase64);
        console.log("ElGamal Decrypted:", decryptedText);
        console.log("ElGamal Time taken:", timeTaken.toFixed(2), "ms");
    } catch (e) {
        console.error("Error in ElGamal:", e);
    }
}



rsaEncryptDecrypt();
elGamalEncryptDecrypt();