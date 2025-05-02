const fs = require('fs');

// Improved BinaryConverter with better error handling
class BinaryConverter {
  static utf8ToBinary(text) {
    try {
      return Buffer.from(text, 'utf8').reduce((acc, byte) => 
        acc + byte.toString(2).padStart(8, '0'), '');
    } catch (error) {
      console.error('UTF8 to Binary conversion error:', error);
      return '';
    }
  }

  static binaryToUtf8(binaryText) {
    try {
      const bytes = [];
      for (let i = 0; i < binaryText.length; i += 8) {
        const byte = binaryText.substr(i, 8);
        if (byte.length === 8) {
          bytes.push(parseInt(byte, 2));
        }
      }
      const result = Buffer.from(bytes).toString('utf8');
      // Replace non-printable characters
      return result.replace(/[^\x20-\x7E]/g, '�');
    } catch (error) {
      console.error('Binary to UTF8 conversion error:', error);
      return '';
    }
  }

  static binaryToHex(binary) {
    return binary.match(/.{1,4}/g)?.map(bin => 
      parseInt(bin, 2).toString(16)).join('') || '';
  }
}

// DES Tables
const desTables = {
    initialPermutationTable: [
      58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
      62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
      57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
      61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7  
    ],
  
    finalPermutationTable: [
      40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
      38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
      36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
      34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25 
    ],
  
    rPermutationTable: [
      16, 7, 20, 21, 29, 12, 28, 17,
      1, 15, 23, 26, 5, 18, 31, 10,
      2, 8, 24, 14, 32, 27, 3, 9,
      19, 13, 30, 6, 22, 11, 4, 25
    ],
  
    rExtensionTo48BitsTable: [
      32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11,
      12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21,
      22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1
    ],
  
    keyPermutationTo56BitsTable: [
      57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
      10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
      63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
      14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4
    ],
  
    keyPermutationTo48BitsTable: [
      14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4,
      26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40,
      51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
    ],
  
    keyShiftTable: [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  
    sConversionTable: [
      [ // S1
        [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
        [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
        [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
        [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
      ],
      [ // S2
        [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
        [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
        [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
        [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
      ],
      [ // S3
        [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
        [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
        [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
        [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
      ],
      [ // S4
        [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
        [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
        [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
        [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
      ],
      [ // S5
        [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
        [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
        [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
        [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
      ],
      [ // S6
        [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
        [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
        [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
        [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
      ],
      [ // S7
        [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
        [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
        [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
        [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
      ],
      [ // S8
        [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
        [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
        [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
        [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
      ]
    ]
  };
  

class Permutator {
  static permutate(block, table) {
    let permutatedBlock = '';
    for (const pos of table) {
      permutatedBlock += block[pos - 1];
    }
    return permutatedBlock;
  }

  static sBlockPermutate(right, sConversionTable, rPermutationTable) {
    let formattedRight = '';
    for (let i = 0; i < right.length / 6; i++) {
      const block = right.substr(i * 6, 6);
      const row = parseInt(block[0] + block[5], 2);
      const column = parseInt(block.substr(1, 4), 2);
      formattedRight += sConversionTable[i][row][column].toString(2).padStart(4, '0');
    }
    return this.permutate(formattedRight, rPermutationTable);
  }
}

class KeysGenerator {
  static generateKeys(key) {
    const keys = new Array(16);
    let key56Bits = Permutator.permutate(key, desTables.keyPermutationTo56BitsTable);

    for (let i = 0; i < 16; i++) {
      key56Bits = this.shiftKey(key56Bits, desTables.keyShiftTable[i]);
      keys[i] = Permutator.permutate(key56Bits, desTables.keyPermutationTo48BitsTable);
    }

    return keys;
  }

  static shiftKey(key, shiftsNumber) {
    const left = key.substr(0, 28);
    const right = key.substr(28);
    return left.substr(shiftsNumber) + left.substr(0, shiftsNumber) + 
           right.substr(shiftsNumber) + right.substr(0, shiftsNumber);
  }
}

class Des {
  constructor(key) {
    this.keys = KeysGenerator.generateKeys(key);
  }

  encode(message, encode = true) {
    let encodedMessage = '';
    for (let i = 0; i < message.length; i += 64) {
      const block = message.substr(i, 64).padEnd(64, '0');
      const permutatedBlock = Permutator.permutate(block, desTables.initialPermutationTable);
      let left = permutatedBlock.substr(0, 32);
      let right = permutatedBlock.substr(32);

      for (let j = 0; j < 16; j++) {
        const temp = right;
        right = Permutator.permutate(right, desTables.rExtensionTo48BitsTable);
        right = this.xor(right, encode ? this.keys[j] : this.keys[15 - j]);
        right = Permutator.sBlockPermutate(right, desTables.sConversionTable, desTables.rPermutationTable);
        right = this.xor(right, left);
        left = temp;
      }

      encodedMessage += Permutator.permutate(right + left, desTables.finalPermutationTable);
    }
    return encodedMessage;
  }

  decode(message) {
    return this.encode(message, false);
  }

  xor(first, second) {
    let result = '';
    for (let i = 0; i < first.length; i++) {
      result += first[i] === second[i] ? '0' : '1';
    }
    return result;
  }
}

function alignMessage(message, blockSize = 64) {
  const missingBits = blockSize - (message.length % blockSize);
  return missingBits === blockSize ? message : message.padEnd(message.length + missingBits, '0');
}

function calculateAvalancheEffect(originalMessage, desInstance) {
  const binaryOriginalMessage = BinaryConverter.utf8ToBinary(originalMessage);
  const alignedMessage = alignMessage(binaryOriginalMessage);
  const encryptedOriginal = desInstance.encode(alignedMessage);
  console.log(`Зашифрованное исходное сообщение: ${BinaryConverter.binaryToHex(encryptedOriginal)}`);
  let modifiedBinaryMessage = binaryOriginalMessage.split('');
  modifiedBinaryMessage[0] = modifiedBinaryMessage[0] === '0' ? '1' : '0'; // Меняем первый бит
  modifiedBinaryMessage = modifiedBinaryMessage.join('');
  console.log(`Модифицированное бинарное сообщение (первый бит изменен): ${modifiedBinaryMessage}`);
  const alignedModifiedMessage = alignMessage(modifiedBinaryMessage);
  const encryptedModified = desInstance.encode(alignedModifiedMessage);
  console.log(`Зашифрованное модифицированное сообщение: ${BinaryConverter.binaryToHex(encryptedModified)}`);
  let diffCount = 0;
  for (let i = 0; i < encryptedOriginal.length; i++) {
    if (encryptedOriginal[i] !== encryptedModified[i]) {
      diffCount++;
    }
  }

  console.log(`Количество изменённых битов: ${diffCount}`);
  return diffCount;
}
function main() {
  const message = "diagram!";
  const binaryMessage = BinaryConverter.utf8ToBinary(message);
  const alignedMessage = alignMessage(binaryMessage);

  console.log(`Оригинальное сообщение: "${message}"`);
  console.log(`Бинарный код: ${binaryMessage}\n`);

  const key1 = "Информац";
  const key2 = "зопаснос";
  const key3 = "лаборато";

  // console.log('Используемые ключи:');
  console.log(`Ключ 1: ${key1}`);
  console.log(`Ключ 2: ${key2}`);
  console.log(`Ключ 3: ${key3}\n`);

  const des1 = new Des(BinaryConverter.utf8ToBinary(key1));
  const des2 = new Des(BinaryConverter.utf8ToBinary(key2));
  const des3 = new Des(BinaryConverter.utf8ToBinary(key3));

  // Encryption
  console.log('Шифрование');
  const startEncode = process.hrtime();
  
  const encodedMessage1 = des1.encode(alignedMessage);
  console.log('\nПосле  DES1:');
  console.log(`Шестнадцатеричный код: ${BinaryConverter.binaryToHex(encodedMessage1)}`);

  const encodedMessage2 = des2.encode(encodedMessage1);
  console.log('\После DES2:');
  console.log(`Шестнадцатеричный код: ${BinaryConverter.binaryToHex(encodedMessage2)}`);

  const encodedMessage3 = des3.encode(encodedMessage2);
  const encodeTime = process.hrtime(startEncode);
  
  console.log('\После DES3 (Конечное сообщение):');
  console.log(`Шестнадцатеричный код: ${BinaryConverter.binaryToHex(encodedMessage3)}`);
  console.log(`Бинарный код: ${encodedMessage3}`);
  
  console.log(`\nВремя шифрования: ${encodeTime[0]}s ${(encodeTime[1] / 1000000).toFixed(2)}ms`);

  // Decryption
  console.log('\nДешифрование');
  const startDecode = process.hrtime();
  
  const decodedMessage3 = des3.decode(encodedMessage3);
  const decodedMessage2 = des2.decode(decodedMessage3);
  const decodedMessage1 = des1.decode(decodedMessage2);
  const decodeTime = process.hrtime(startDecode);
  
  console.log('\nКонечное расшифрованное сообщение:');
  console.log(`Текст: "${BinaryConverter.binaryToUtf8(decodedMessage1)}"`);
  console.log(`Бинарный код: ${decodedMessage1}`);
  
  console.log(`\nВремя дешифрования: ${decodeTime[0]}s ${(decodeTime[1] / 1000000).toFixed(2)}ms`);

  console.log('\nПровреа');
  console.log(`Начальное:  ${binaryMessage}`);
  console.log(`Расшифрованнное: ${decodedMessage1}`);
  console.log(`Совпадание: ${binaryMessage === decodedMessage1 ? 'да' : 'нет'}`);


  const message1 = "diagram!";
  const key = "Информац";
  const des = new Des(BinaryConverter.utf8ToBinary(key));
  const diffCount = calculateAvalancheEffect(message1, des);
  console.log(`Лавинный эффект: ${diffCount} бит изменилось после изменения одного бита в исходном сообщении.`);

}

main();


const weakKeys = [
  "0101010101010101", // слабый ключ 1
  "1F1F1F1F0E0E0E0E", // слабый ключ 2
  "E0E0E0E0F1F1F1F1", // слабый ключ 3
  "FEFEFEFEFEFEFEFE"  // слабый ключ 4
];

const semiWeakKeys = [
  "01FE01FE01FE01FE", // полуслабый ключ 1
  "FE01FE01FE01FE01", // полуслабый ключ 2
  "1FE01FE01FE01FE0", // полуслабый ключ 3
  "1FFE1EEE0EFE0EFE"  // полуслабый ключ 4
];

function testWeakKeys() {
  weakKeys.forEach((key, index) => {
    console.log(`Тестирование слабого ключа ${index + 1}: ${key}`);
    const des = new Des(BinaryConverter.utf8ToBinary(key));
    const message = "diagram!";
    const binaryMessage = BinaryConverter.utf8ToBinary(message);
    const alignedMessage = alignMessage(binaryMessage);

    console.log(`Шифруем сообщение: "${message}" с ключом ${key}`);
    const encodedMessage = des.encode(alignedMessage);
    console.log(`Зашифрованное сообщение: ${BinaryConverter.binaryToHex(encodedMessage)}`);

    const diffCount = calculateAvalancheEffect(message, des);
    console.log(`Лавинный эффект для слабого ключа ${index + 1}: ${diffCount} изменённых битов\n`);
  });
}

function testSemiWeakKeys() {
  semiWeakKeys.forEach((key, index) => {
    console.log(`Тестирование полуслабого ключа ${index + 1}: ${key}`);
    const des = new Des(BinaryConverter.utf8ToBinary(key));
    const message = "diagram!";
    const binaryMessage = BinaryConverter.utf8ToBinary(message);
    const alignedMessage = alignMessage(binaryMessage);

    console.log(`Шифруем сообщение: "${message}" с ключом ${key}`);
    const encodedMessage = des.encode(alignedMessage);
    console.log(`Зашифрованное сообщение: ${BinaryConverter.binaryToHex(encodedMessage)}`);

    const diffCount = calculateAvalancheEffect(message, des);
    console.log(`Лавинный эффект для полуслабого ключа ${index + 1}: ${diffCount} изменённых битов\n`);
  });
}

testWeakKeys();
testSemiWeakKeys();
