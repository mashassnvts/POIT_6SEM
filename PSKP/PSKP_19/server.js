const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const productRouter = require('./routes/productRouter');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use("/api/products", productRouter);

app.use((req, res) => {
    res.status(404).send('Страница не найдена');
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
