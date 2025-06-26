const TelegramBot = require('node-telegram-bot-api');

const token = '7839395633:AAHGnDXLoHQBQjmwHfkrh_sKJDWhUUeyYpM';

const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (text && !text.startsWith('/')) {
    bot.sendMessage(chatId, `echo: ${text}`);
  } else if (text === '/start') {
    bot.sendMessage(chatId, 'Привет! Я Бот".');
  }
});

console.log('Бот запущен и ожидает сообщений...');