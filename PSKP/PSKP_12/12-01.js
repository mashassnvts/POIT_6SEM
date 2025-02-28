const http = require('http');
const url = require('url');
const fs = require('fs');
const { error } = require('console');
const WebSocketServer = require('rpc-websockets').Server;

const wsServer = new WebSocketServer({ port: 4000, host: 'localhost' });
wsServer.event('fileModified');

const isBackupFile = (fileName) => /\d+_StudentList\.json/.test(fileName);

const send405 = (res) => {
  res.statusCode = 405;
  res.statusMessage = 'Method Not Allowed';
  res.end('Use a different HTTP method.');
};

const handleRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET') {
    if (pathname === '/') {
      fs.readFile('./StudentList.json', 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read student list.' }));
        } else {
          try {
            const students = JSON.parse(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(students));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format in student list.' }));
          }
        }
      });

    } else if (/^\/\d+$/.test(pathname)) {
      const studentId = Number(pathname.slice(1));
      fs.readFile('./StudentList.json', 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read student list.' }));
        } else {
          try {
            const students = JSON.parse(data);
            const student = students.find(s => s.id === studentId);
            if (student) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(student));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Student not found.' }));
            }
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format in student list.' }));
          }
        }
      });
    } else if (pathname === '/backup') {
      const backups = fs.readdirSync('./').filter(isBackupFile);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(backups));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
  else if (req.method === 'POST') {
    if (pathname === '/') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          const newStudent = JSON.parse(body);
          fs.readFile('./StudentList.json', 'utf8', (err, data) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to read student list.' }));
            } else {
              try {
                const students = JSON.parse(data);
                if (students.some(s => s.id === newStudent.id)) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Student already exists.' }));
                } else {
                  students.push(newStudent);
                  fs.writeFile('./StudentList.json', JSON.stringify(students, null, 2), err => {
                    if (err) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'Failed to update student list.' }));
                    } else {
                      res.writeHead(201, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(newStudent));
                    }
                  });
                }
              } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON format in student list.' }));
              }
            }
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON data in request.' }));
        }
      });
     
    } else if (pathname === '/backup') {
      setTimeout(() => {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
        const backupFileName = `${timestamp}_StudentList.json`;
        fs.copyFile('./StudentList.json', `./${backupFileName}`, err => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Failed to create backup.');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Backup created successfully.');
            fs.watch(`./${backupFileName}`, () => {
              wsServer.emit('fileModified');
            });
          }
        });
      }, 2000);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
  else if (req.method === 'PUT') {
    if (pathname === '/') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          const updatedStudent = JSON.parse(body);
          fs.readFile('./StudentList.json', 'utf8', (err, data) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to read student list.' }));
            } else {
              try {
                const students = JSON.parse(data);
                const index = students.findIndex(s => s.id === updatedStudent.id);
                if (index === -1) {
                  res.writeHead(404, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Student not found.' }));
                } else {
                  students[index] = updatedStudent;
                  fs.writeFile('./StudentList.json', JSON.stringify(students, null, 2), err => {
                    if (err) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'Failed to update student list.' }));
                    } else {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(updatedStudent));
                    }
                  });
                }
              } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON format in student list.' }));
              }
            }
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON data in request.' }));
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
  else if (req.method === 'DELETE') {
    if (/^\/backup\/\d+$/.test(pathname)) {
      const thresholdDate = pathname.split('/')[2];
      fs.readdirSync('./').forEach(file => {
        if (isBackupFile(file) && file.split('_')[0] < thresholdDate) {
          fs.unlinkSync(`./${file}`);
        }
      });
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Old backups deleted.');
    } else if (/^\/\d+$/.test(pathname)) {
      const studentId = Number(pathname.slice(1));
      fs.readFile('./StudentList.json', 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read student list.' }));
        } else {
          try {
            const students = JSON.parse(data);
            const index = students.findIndex(s => s.id === studentId);
            if (index === -1) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Student not found.' }));
            } else {
              const removedStudent = students.splice(index, 1);
              fs.writeFile('./StudentList.json', JSON.stringify(students, null, 2), err => {
                if (err) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to update student list.' }));
                } else {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(removedStudent[0]));
                }
              });
            }
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format in student list.' }));
          }
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
  else {
    send405(res);
  }
};

const server = http.createServer((req, res) => {
  fs.watch('./StudentList.json', () => {
    wsServer.emit('fileModified');
  });
  handleRequest(req, res);
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});

