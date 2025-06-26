const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

app.use(bodyParser.json());

let phoneBook = [
  { id: 1, name: "Сосновец Мария", phone: "+375291234567", address: "Мозырь" },
  { id: 2, name: "Кивлинас Олег", phone: "+375291234568", address: "Мозырь, катапульта" }
];

app.get('/TS', (req, res) => {
  try {
    res.status(200).json(phoneBook);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/TS', (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newContact = {
      id: phoneBook.length > 0 ? Math.max(...phoneBook.map(c => c.id)) + 1 : 1,
      name,
      phone,
      address: address || null
    };

    phoneBook.push(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/TS', (req, res) => {
  try {
    const { id, name, phone, address } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const contactIndex = phoneBook.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = {
      id,
      name: name || phoneBook[contactIndex].name,
      phone: phone || phoneBook[contactIndex].phone,
      address: address !== undefined ? address : phoneBook[contactIndex].address
    };

    phoneBook[contactIndex] = updatedContact;
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/TS', (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const contactIndex = phoneBook.findIndex(c => c.id === parseInt(id));
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    phoneBook = phoneBook.filter(c => c.id !== parseInt(id));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Swagger UI доступен по http://localhost:${PORT}/api-docs`);
});