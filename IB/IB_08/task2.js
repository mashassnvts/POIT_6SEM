const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Инициализация RC4
function RC4(key) {
  const S = new Array(256); // Таблица S (размер 2^8 = 256)
  for (let i = 0; i < 256; i++) {
    S[i] = i;
  }

  // KSA (Key-Scheduling Algorithm)
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) % 256;
    [S[i], S[j]] = [S[j], S[i]]; // Swap
  }

  // PRGA (Pseudo-Random Generation Algorithm)
  function* generateKeystream(length) {
    let i = 0, j = 0;
    const S_copy = [...S]; // Копируем S, чтобы не менять оригинал
    for (let k = 0; k < length; k++) {
      i = (i + 1) % 256;
      j = (j + S_copy[i]) % 256;
      [S_copy[i], S_copy[j]] = [S_copy[j], S_copy[i]]; // Swap
      const t = (S_copy[i] + S_copy[j]) % 256;
      yield S_copy[t];
    }
  }

  return {
    generateKeystream,
    encrypt: (text) => {
      const textBytes = Buffer.from(text, 'utf8');
      const keystream = generateKeystream(textBytes.length);
      const encrypted = new Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keystream.next().value; // XOR
      }
      return Buffer.from(encrypted);
    },
    decrypt: (encrypted) => {
      const keystream = generateKeystream(encrypted.length);
      const decrypted = new Array(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keystream.next().value; // XOR
      }
      return Buffer.from(decrypted).toString('utf8');
    }
  };
}

// Оценка скорости генерации ПСП
function measureSpeed(generateKeystream, length) {
  const start = performance.now();
  const stream = [...generateKeystream(length)]; // Генерируем ПСП
  const end = performance.now();
  const time = end - start; // Время в миллисекундах
  const speed = (length / time).toFixed(2); // Байт/мс
  return { stream, time, speed };
}

// Запуск программы
function start() {
  const key = [122, 125, 48, 84, 201]; 
  const rc4 = RC4(key);
  const message = "Sosnovets Maria"; 

  console.log('Исходное сообщение:', message);
 
  const encrypted = rc4.encrypt(message);
  console.log('Зашифрованное сообщение (в шестнадцатеричном виде):', encrypted.toString('hex'));
  const decrypted = rc4.decrypt(encrypted);
  console.log('Расшифрованное сообщение:', decrypted);

  rl.question('Введите количество байтов для генерации ПСП: ', (lengthInput) => {
    const length = parseInt(lengthInput);
    if (isNaN(length) || length <= 0) {
      console.log('Ошибка: введите число > 0.');
      rl.close();
      return;
    }

    const { stream, time, speed } = measureSpeed(rc4.generateKeystream, length);
    console.log('Сгенерированная ПСП:', stream.join(' '));
    console.log(`Время генерации: ${time.toFixed(2)} мс`);
    console.log(`Скорость генерации: ${speed} байт/мс`);

    rl.close();
  });
}

start();