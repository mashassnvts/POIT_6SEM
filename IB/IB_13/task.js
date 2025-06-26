const fs = require('fs-extra');
const { Command } = require('commander');
const LineLengthStegano = require('./lineLengthStegano');
const ColorStegano = require('./colorStegano');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`
};

const program = new Command();
const lineLengthMethod = new LineLengthStegano();
const colorMethod = new ColorStegano();

program
  .name('text-stegano')
  .description('Приложение для текстовой стеганографии')
  .version('1.0.0');

program.command('embed')
  .description('Встроить сообщение в текстовый файл')
  .requiredOption('-m, --message <message>', 'Сообщение для встраивания')
  .requiredOption('-i, --input <file>', 'Входной файл')
  .requiredOption('-o, --output <file>', 'Выходной файл')
  .requiredOption('-t, --type <type>', 'Тип стеганографии (line|color)')
  .action(async (options) => {
    try {
      if (!fs.existsSync(options.input)) {
        throw new Error('Входной файл не существует');
      }

      let success;
      if (options.type === 'line') {
        success = await lineLengthMethod.embed(options.message, options.input, options.output);
      } else if (options.type === 'color') {
        success = await colorMethod.embed(options.message, options.input, options.output);
      } else {
        throw new Error('Неизвестный тип стеганографии. Используйте line или color');
      }

      if (success) {
        console.log(colors.green('Операция завершена успешно!'));
      }
    } catch (error) {
      console.error(colors.red(`Ошибка: ${error.message}`));
    }
  });

program.command('extract')
  .description('Извлечь сообщение из текстового файла')
  .requiredOption('-i, --input <file>', 'Входной файл')
  .requiredOption('-t, --type <type>', 'Тип стеганографии (line|color)')
  .action(async (options) => {
    try {
      if (!fs.existsSync(options.input)) {
        throw new Error('Входной файл не существует');
      }

      let message;
      if (options.type === 'line') {
        message = await lineLengthMethod.extract(options.input);
      } else if (options.type === 'color') {
        message = await colorMethod.extract(options.input);
      } else {
        throw new Error('Неизвестный тип стеганографии. Используйте line или color');
      }

      if (message) {
        console.log(colors.green('Сообщение успешно извлечено!'));
      } else {
        console.log(colors.yellow('Сообщение не найдено или произошла ошибка'));
      }
    } catch (error) {
      console.error(colors.red(`Ошибка: ${error.message}`));
    }
  });

program.parse(process.argv);