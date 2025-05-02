const express = require('express');
const passport = require('passport');
const DigestStrategy = require('passport-http').DigestStrategy;
const userDB = require('./users.json');
const session = require('express-session')({
  saveUninitialized: false,
  resave: false,
  secret: 'secretKey'
});

// Функции для работы с учетными данными
const findUser = username =>
  userDB.find(u => u.user.toLowerCase() === username.toLowerCase());

// Инициализация приложения
const app = express();
app.use(session);
app.use(passport.initialize());

passport.use(new DigestStrategy(
  { qop: 'auth' },
  (username, done) => {
    const user = findUser(username);
    if (!user) {
      return done(null, false, { message: 'Пользователь не найден' });
    }
    return done(null, user, user.password);
  },
  (params, done) => done(null, true) 
));


app.get('/login', [
  (req, res, next) => {
    if (req.session.needLogout) {
      req.session.needLogout = false;
      delete req.headers.authorization;
    }
    next();
  },
  passport.authenticate('digest', { session: false }),
  (req, res) => res.redirect('/resource')
]);

app.get('/logout', (req, res) => {
  req.session.needLogout = true;

  res.redirect('/login');
});

app.get('/resource',
  passport.authenticate('digest', { session: false }),
  (req, res) => res.send('ДОСТУП К РЕСУРСУ РАЗРЕШЕН')
);

app.use((req, res) =>
  res.status(404).send('Страница не найдена')
);

app.listen(3000, () =>
  console.log('Сервер запущен на порту 3000')
);
