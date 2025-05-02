const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const userDB = require('./users.json');

// Middleware для аутентификации
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    // Если пользователь уже аутентифицирован
    return next();
  }
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу логина
  res.redirect('/login');
};

// Утилиты для работы с учетными данными
const findUser = (username) => userDB.find(u => u.user.toLowerCase() === username.toLowerCase());
const checkPass = (inputPass, storedPass) => inputPass === storedPass;

// Инициализация приложения
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
}));

// Маршруты
app.get('/login', (req, res) => {
  const error = req.session.error;
  delete req.session.error; // Очистить ошибку после показа
  res.send(`
    <form method="POST" action="/login">
      ${error ? `<p style="color:red;">${error}</p>` : ''}
      <label>Логин: <input type="text" name="username" /></label><br/>
      <label>Пароль: <input type="password" name="password" /></label><br/>
      <button type="submit">Войти</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = findUser(username);

  if (!user || !checkPass(password, user.password)) {
    req.session.error = 'Неверное имя пользователя или пароль';
    return res.redirect('/login');
  }

  req.session.user = user.user; // Сохраняем имя пользователя в сессии
  res.redirect('/resource');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/resource', authMiddleware, (req, res) => {
  res.send(`ДОСТУП К РЕСУРСУ РАЗРЕШЕН. Привет, ${req.session.user}!`);
});

// Обработка 404
app.use((req, res) => {
  res.status(404).send('Страница не найдена');
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
