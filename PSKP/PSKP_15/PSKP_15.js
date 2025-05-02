const http = require('http');
const mongoose = require('mongoose');
const { StringDecoder } = require('string_decoder');
const querystring = require('querystring');


mongoose.connect('mongodb+srv://bstu_admin:Masha2004@cluster0.iyjsakg.mongodb.net/bstu?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));



const facultySchema= new mongoose.Schema({
    faculty:String,
    faculty_name:String
});

const pulpitSchema = new mongoose.Schema({
    pulpit: String,
    pulpit_name: String,
    faculty: String
});

const Pulpit = mongoose.model('Pulpit', pulpitSchema, 'pulpit');
const Faculty = mongoose.model('Faculty', facultySchema, 'faculty');


  

const server = http.createServer(async (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    
    req.on('end', async () => {
        buffer += decoder.end();
        
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const path = parsedUrl.pathname;
        const method = req.method.toUpperCase();
            
        let payload = {};
        try {
            payload = buffer ? JSON.parse(buffer) : {};
        } catch (e) {
        }
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');
        
        if (method === 'OPTIONS') {
            res.writeHead(200);
            return res.end();
        }
        
        try {
            if (path === '/api/faculties' && method === 'GET') {
                const faculties = await Faculty.find();
                res.writeHead(200);
                res.end(JSON.stringify(faculties));
            }
            else if (path === '/api/faculties' && method === 'POST') {
                const faculty = new Faculty(payload);
                await faculty.save();
                res.writeHead(201);
                res.end(JSON.stringify(faculty));
            }
            else if (path === '/api/faculties' && method === 'PUT') {
                const faculty = await Faculty.findOneAndUpdate(
                    { faculty: payload.faculty },
                    payload,
                    { new: true }
                );
                if (!faculty) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Faculty not found' }));
                }
                res.writeHead(200);
                res.end(JSON.stringify(faculty));
            }
            else if (path.startsWith('/api/faculties/') && method === 'DELETE') {
                const code = path.split('/')[3];
                
                await Pulpit.deleteMany({ faculty: code });
                
                const faculty = await Faculty.findOneAndDelete({ faculty: code });
                if (!faculty) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Faculty not found' }));
                }
                res.writeHead(200);
                res.end(JSON.stringify(faculty));
            }
            else if (path === '/api/pulpits' && method === 'GET') {
                const pulpits = await Pulpit.find();
                res.writeHead(200);
                res.end(JSON.stringify(pulpits));
            }
            else if (path === '/api/pulpits' && method === 'POST') {
                const facultyExists = await Faculty.exists({ faculty: payload.faculty });
                if (!facultyExists) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: 'Faculty does not exist' }));
                }
                const pulpit = new Pulpit(payload);
                await pulpit.save();
                res.writeHead(201);
                res.end(JSON.stringify(pulpit));
            }
            else if (path === '/api/pulpits' && method === 'PUT') {
                if (payload.faculty) {
                    const facultyExists = await Faculty.exists({ faculty: payload.faculty });
                    if (!facultyExists) {
                        res.writeHead(400);
                        return res.end(JSON.stringify({ error: 'Faculty does not exist' }));
                    }
                }
                const pulpit = await Pulpit.findOneAndUpdate(
                    { pulpit: payload.pulpit },
                    payload,
                    { new: true }
                );
                if (!pulpit) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Pulpit not found' }));
                }
                res.writeHead(200);
                res.end(JSON.stringify(pulpit));
            }
            else if (path.startsWith('/api/pulpits/') && method === 'DELETE') {
                const code = path.split('/')[3];
    
                const pulpit = await Pulpit.findOneAndDelete({ pulpit: code });
                if (!pulpit) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({ error: 'Pulpit not found' }));
                }
                res.writeHead(200);
                res.end(JSON.stringify(pulpit));
            }
            
            else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        }
    });
});

server.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});