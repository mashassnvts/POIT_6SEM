const http = require('http');
const url = require('url');
const fs = require('fs');
const {Sequelize, DataTypes} = require('sequelize');
const {parse} = require('querystring');

const config = {
    user: 'masha',
    password: 'qq',
    server: '127.0.0.1',
    database: 'SMI',
    pool: {
        max: 10, 
        min: 0,  
        idleTimeoutMillis: 30000 
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.server,
    dialect: 'mssql',
    dialectOptions: config.options,
    pool: config.pool
});

const Faculty = sequelize.define('Faculty', {
  faculty: { type: DataTypes.STRING, primaryKey: true },
  faculty_name: DataTypes.STRING
}, { 
  timestamps: false,
  tableName: 'Faculties'  
});

const Pulpit = sequelize.define('Pulpit', {
  pulpit: { type: DataTypes.STRING, primaryKey: true },
  pulpit_name: DataTypes.STRING,
  faculty: {
      type: DataTypes.STRING,
      references: {
          model: Faculty,
          key: 'faculty'
      },
      onDelete: 'CASCADE'
  }
}, { 
  timestamps: false,
  tableName: 'Pulpits'  
});

const AuditoriumType = sequelize.define('AuditoriumType', {
  auditorium_type: { type: DataTypes.STRING, primaryKey: true },
  auditorium_typename: DataTypes.STRING
}, { 
  timestamps: false,
  tableName: 'AuditoriumTypes'  
});

const Subject = sequelize.define('Subject', {
  subject: { type: DataTypes.STRING, primaryKey: true },
  subject_name: DataTypes.STRING,
  pulpit: {
      type: DataTypes.STRING,
      references: {
          model: Pulpit,
          key: 'pulpit'
      },
      onDelete: 'CASCADE'
  }
}, { 
  timestamps: false,
  tableName: 'Subjects'  
});

const Auditorium = sequelize.define('Auditorium', {
  auditorium: { type: DataTypes.STRING, primaryKey: true },
  auditorium_name: DataTypes.STRING,
  auditorium_type: {
      type: DataTypes.STRING,
      references: {
          model: AuditoriumType,
          key: 'auditorium_type'
      },
      onDelete: 'CASCADE'
  },
  building: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
  floor: DataTypes.INTEGER
}, { 
  timestamps: false,
  tableName: 'Auditoria'  
});


  Faculty.hasMany(Pulpit, { onDelete: 'CASCADE', foreignKey: 'faculty' });
  Pulpit.belongsTo(Faculty, { foreignKey: 'faculty' });
  Pulpit.hasMany(Subject, { onDelete: 'CASCADE', foreignKey: 'pulpit' });
  Subject.belongsTo(Pulpit, { foreignKey: 'pulpit' });
  AuditoriumType.hasMany(Auditorium, { onDelete: 'CASCADE',   foreignKey: 'auditorium_type' });
  Auditorium.belongsTo(AuditoriumType, { foreignKey: 'auditorium_type' });

  
  const routes = {
    faculties : Faculty,
    pulpits : Pulpit,
    subjects : Subject,
    auditoriumstype : AuditoriumType,
    auditoriums : Auditorium
  };

  const server = http.createServer((req, res) => {
    const urlparts = req.url.split('/').filter(Boolean);
    const resource = urlparts[0] === 'api' ? urlparts[1] : null;
    const id = urlparts[0] === 'api' ? urlparts[2] : null;
    const model = routes[resource];
    const method = req.method;

    if(req.url === '/' && method === 'GET'){
      fs.readFile('index.html', (err,data) =>{
        if(err){
          res.writeHead(500, {'Content-Type': 'text/html'});
          res.end('<h1>Internal Server Error</h1>');}
          else{
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
          }
      });
      return;
    }

    if(!model){
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', async () => {
      try {
        if(['POST', 'PUT'].includes(method) && body) body = JSON.parse(body);
    
        if(method === 'GET'){
          const result = id ? await model.findByPk(id) : await model.findAll();
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(result));
        } 
        else if(method === 'POST'){
          const newItem = await model.create(body);
          res.writeHead(201, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(newItem));
        } 
         else if (method === 'PUT') {
          if (!body || !body[model.primaryKeyAttribute]) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'ID is required for PUT in body' }));
              return;
          }
      
          const id = body[model.primaryKeyAttribute]; 
          delete body[model.primaryKeyAttribute];
      
          const [updated] = await model.update(body, {
              where: { [model.primaryKeyAttribute]: id }
          });
      
          if (updated) {
              const updatedItem = await model.findByPk(id);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(updatedItem));
          } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Record not found' }));
          }
      }
      
        else if(method === 'DELETE'){
          if(!id){
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'ID is required'}));
            return;
          }
          
          const primaryKey = model.primaryKeyAttribute;
          const deleted = await model.destroy({ where: { [primaryKey]: id } });
          res.writeHead(deleted ? 200 : 404, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({deleted: !!deleted}));
        } 
        else {
          res.writeHead(405, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: 'Method not allowed'}));
        }
      } catch(error) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: error.message}));
      }
    });
  });

server.listen(3000, async () => {
  console.log('Server is running on port 3000');
  try{
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database connected and synced');
  } catch(error){
    console.error('Unable to connect to the database:', error);
  }
});

