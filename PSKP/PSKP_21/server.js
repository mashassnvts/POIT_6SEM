const http = require('express');
const auth = require('passport');
const httpAuth = require('passport-http').BasicStrategy;
const userDB = require('./users.json');
const sess = require('express-session')({
  saveUnmodified: false,
  resave: false,
  secret: 'secretKey'
});

// Функции для работы с учетными данными
const findUser = username => 
  userDB.find(u => u.user.toLowerCase() === username.toLowerCase());

const checkPass = (inputPass, storedPass) => inputPass === storedPass;

// Инициализация приложения
const server = http();
server.use(sess);
server.use(auth.initialize());

// Настройка стратегии аутентификации
auth.use(new httpAuth((login, pwd, callback) => {
  const account = findUser(login);
  
  if (!account) {
    return callback(null, false, { message: 'Неверный пользователь' });
  }
  
  if (!checkPass(pwd, account.password)) {
    return callback(null, false, { message: 'Неверный пароль' });
  }
  
  return callback(null, login);
}));

// Маршруты
server.get('/login', [
  (req, res, next) => {
    if (req.session.needLogout) {
      req.session.needLogout = false;
      delete req.headers.authorization;
    }
    next();
  },
  auth.authenticate('basic', { session: false }),
  (req, res) => res.redirect('/resource')
]);

server.get('/logout', (req, res) => {
  req.session.needLogout = true;
  res.redirect('/login');
});

server.get('/resource', 
  auth.authenticate('basic', { session: false }),
  (req, res) => res.send('ДОСТУП К РЕСУРСУ РАЗРЕШЕН')
);

server.use((req, res) => 
  res.status(404).send('Страница не найдена')
);

// Запуск сервера
server.listen(3000, () => 
  console.log('Сервер запущен на порту 3000')
);