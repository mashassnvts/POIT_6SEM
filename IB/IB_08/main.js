const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// === Реализация ЛКГ ===
function generateLCG(seed, count) {
  const a = 430; // Множитель
  const c = 2531; // Прибавка
  const n = 11979; // Модуль
  let current = seed;
  const sequence = [];

  for (let i = 0; i < count; i++) {
    current = (a * current + c) % n; // Формула ЛКГ
    sequence.push(current);
  }

  return sequence;
}

// Запрос параметров и генерация ПСП
function start() {
  console.log('Генератор случайных чисел');
  rl.question('Введите начальное значение: ', (seedInput) => {
    const seed = parseInt(seedInput);
    if (isNaN(seed) || seed < 0) {
      console.log('Ошибка: введите целое число >= 0.');
      rl.close();
      return;
    }

    rl.question('Введите количество чисел: ', (countInput) => {
      const count = parseInt(countInput);
      if (isNaN(count) || count <= 0) {
        console.log('Ошибка: введите число > 0.');
        rl.close();
        return;
      }

      const sequence = generateLCG(seed, count); // Вызов ЛКГ
      console.log('Полученные числа:');
      console.log(sequence.join(' ')); // Вывод в строку с пробелами

      rl.close();
    });
  });
}

// Запуск программы
start();