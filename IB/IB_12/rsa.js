const crypto = require('crypto');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Генерация ключей RSA...\n");
const startKeyGen = process.hrtime();
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
const endKeyGen = process.hrtime(startKeyGen);
console.log(`Время генерации ключей: ${endKeyGen[0]}s ${endKeyGen[1] / 1000000}ms\n`);

console.log("=== Открытый ключ ===");
console.log(publicKey);
console.log("\n=== Закрытый ключ ===");
console.log(privateKey);
console.log("");

function createDigitalSignature(message) {
  const startTime = process.hrtime();
  
  const hash = crypto.createHash('sha256').update(message).digest('hex');
  
  const signer = crypto.createSign('sha256');
  signer.update(hash);
  signer.end();
  
  const signature = signer.sign(privateKey, 'base64');
  
  const endTime = process.hrtime(startTime);
  console.log(`Время создания подписи: ${endTime[0]}s ${endTime[1] / 1000000}ms`);
  
  return signature;
}

function verifyDigitalSignature(message, signature) {
  const startTime = process.hrtime();
  
  const hash = crypto.createHash('sha256').update(message).digest('hex');
  
  const verifier = crypto.createVerify('sha256');
  verifier.update(hash);
  verifier.end();
  
  const isValid = verifier.verify(publicKey, signature, 'base64');
  
  const endTime = process.hrtime(startTime);
  console.log(`Время проверки подписи: ${endTime[0]}s ${endTime[1] / 1000000}ms`);
  
  return isValid;
}

function main() {
  readline.question('Введите сообщение для подписи: ', (message) => {
    const signature = createDigitalSignature(message);
    console.log(`\n=== Цифровая подпись ===`);
    console.log(signature);
    
    const isValid = verifyDigitalSignature(message, signature);
    console.log(`\nПроверка подписи: ${isValid ? 'Да Подпись верна' : 'нет Подпись недействительна'}`);
    
    readline.close();
  });
}

// Запуск программы
main();