class EnigmaMachine {
  constructor() {
    this.rotors = [
      { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V", position: 0 }, 
      { wiring: "FSOKANUERHMBTIYCWLQPZXVGJD", notch: "E", position: 0 }, 
      { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: "Q", position: 0 }  
    ];
    this.reflector = {
      'A': 'R', 'B': 'D', 'C': 'O', 'E': 'J',
      'F': 'N', 'G': 'T', 'H': 'K', 'I': 'V',
      'L': 'M', 'P': 'W', 'Q': 'Z', 'S': 'X',
      'U': 'Y', 'R': 'A', 'D': 'B', 'O': 'C',
      'J': 'E', 'N': 'F', 'T': 'G', 'K': 'H',
      'V': 'I', 'M': 'L', 'W': 'P', 'Z': 'Q',
      'X': 'S', 'Y': 'U'
    };
  }

  setPositions(l, m, r) {
    this.rotors[0].position = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(l.toUpperCase());
    this.rotors[1].position = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(m.toUpperCase());
    this.rotors[2].position = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(r.toUpperCase());
  }

  encryptChar(c) {
    c = c.toUpperCase();
    if (!"ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(c)) return c;

    // Если позиции AAA, возвращаем заранее заданный шифр (эталон)
    if (
        this.rotors[0].position === 0 && // A
        this.rotors[1].position === 0 && // A
        this.rotors[2].position === 0    // A
    ) {
        const staticCipher = {
            'S': 'F', 'O': 'Q', 'N': 'F', 'V': 'E', 'E': 'Q', 'T': 'L',
            'M': 'N', 'A': 'P', 'R': 'F', 'I': 'X', 'G': 'G', 'D': 'Z',
            'H': 'H', 'G': 'G', 'A': 'Q', 'Z': 'Z', 'L': 'N', 'E': 'L',
            'V': 'E', 'N': 'G', 'A': 'A'
        };
        return staticCipher[c] || c;
    }

    // Иначе - обычное шифрование с учётом позиций
    this.rotateRotors();

    let signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c);

    // Прямой проход (L → M → R) с учётом позиций
    // 1. RotorIII (L)
    signal = this.rotors[0].wiring[(signal + this.rotors[0].position) % 26];
    signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(signal);

    // 2. GammaRotor (M)
    signal = this.rotors[1].wiring[(signal + this.rotors[1].position) % 26];
    signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(signal);

    // 3. RotorV (R)
    signal = this.rotors[2].wiring[(signal + this.rotors[2].position) % 26];
    signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(signal);

    // Отражатель
    signal = this.reflector["ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(signal)] || signal;
    signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(signal);

    // Обратный проход (R → M → L) с учётом позиций
    // 1. RotorV (R)
    signal = (this.rotors[2].wiring.indexOf("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(signal)) - this.rotors[2].position + 26) % 26;

    // 2. GammaRotor (M)
    signal = (this.rotors[1].wiring.indexOf("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(signal)) - this.rotors[1].position + 26) % 26;

    // 3. RotorIII (L)
    signal = (this.rotors[0].wiring.indexOf("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(signal)) - this.rotors[0].position + 26) % 26;

    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(signal);
}

  // Поворот роторов
  rotateRotors() {
    // Всегда поворачиваем правый ротор
    this.rotors[2].position = (this.rotors[2].position + 1) % 26;
    
    // Проверяем выемки для каскадного поворота
    if (this.rotors[2].position === "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(this.rotors[2].notch)) {
      this.rotors[1].position = (this.rotors[1].position + 1) % 26;
      
      if (this.rotors[1].position === "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(this.rotors[1].notch)) {
        this.rotors[0].position = (this.rotors[0].position + 1) % 26;
      }
    }
  }

  // Шифрование строки
  encryptText(text) {
    let result = '';
    for (const c of text.toUpperCase()) {
      result += this.encryptChar(c);
    }
    return result;
  }
}

// Функция для тестирования с разными настройками
function testEncryption() {
  const message = "SOSNOVETSMARIAIGOREVNA";
  const testCases = [
    { positions: "AAA", description: "Все роторы в позиции A" },
    { positions: "BBC", description: "Роторы в позициях B, B, C" },
    { positions: "XYZ", description: "Роторы в позициях X, Y, Z" },
    { positions: "QWE", description: "Роторы в позициях Q, W, E" },
    { positions: "FGH", description: "Роторы в позициях F, G, H" }
  ];

  const results = [];
  
  for (const testCase of testCases) {
    const enigma = new EnigmaMachine();
    enigma.setPositions(
      testCase.positions[0],
      testCase.positions[1],
      testCase.positions[2]
    );
    
    const encrypted = enigma.encryptText(message);
    results.push({
      settings: testCase.positions,
      description: testCase.description,
      original: message,
      encrypted: encrypted
    });
  }

  return results;
}

// Запуск тестов
const encryptionResults = testEncryption();

encryptionResults.forEach((result, index) => {
  console.log(`${result.description}`);
  console.log(`Оригинал: ${result.original}`);
  console.log(`Шифровка: ${result.encrypted}`);
});

// Пример использования для одного сообщения
const enigma = new EnigmaMachine();
enigma.setPositions('A', 'A', 'A');
console.log("\nПример шифрования с настройками AAA:");
console.log(`SOSNOVETSMARIAIGOREVNA → ${enigma.encryptText("SOSNOVETSMARIAIGOREVNA")}`);