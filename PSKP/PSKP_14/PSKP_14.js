const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
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

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Connected to MSSQL');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}
connectDB();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/faculties', async (req, res) => {
    try {
        await poolConnect; 
        const request = pool.request();
        const result = await request.query('SELECT * FROM  Faculty');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения факультетов' });
    }
});

app.get('/api/pulpits', async (req, res) => {
    try {
        await poolConnect; 
        const request = pool.request();
        const result = await request.query('SELECT * FROM Pulpit');
                if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Кафедры не найдены' });
        }
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения кафедр' });
    }
});

app.get('/api/subjects', async (req, res) => {
    try {
        await poolConnect; 
        const request = pool.request();
        const result = await request.query('SELECT * FROM Subject');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения учебных дисциплин' });
    }
});

app.get('/api/auditoriumstypes', async (req, res) => {
    try {
        await poolConnect; 
        const request = pool.request();
        const result = await request.query('SELECT * FROM Auditorium_Type');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения типов аудиторий' });
    }
});

app.get('/api/auditoriums', async (req, res) => {
    try {
        await poolConnect; 
        const request = pool.request();
        const result = await request.query('SELECT * FROM Auditorium');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения аудиторий' });
    }
});

app.post('/api/faculties', async (req, res) => {
    const { faculty_name } = req.body;  
    console.log('Received data:', { faculty_name});
    try {
        const result = await sql.query`
            INSERT INTO Faculty (faculty_name)
            VALUES (${faculty_name})
            SELECT * FROM Faculty WHERE faculty_name = ${faculty_name}
        `;
        res.json(result.recordset[0]);  
    } catch (error) {
        console.error('Ошибка при добавлении факультета:', error);
        res.status(500).json({ error: 'Ошибка добавления факультета' });
    }
});

app.post('/api/pulpits', async (req, res) => {
    const { pulpit_name, faculty_id } = req.body;
    console.log('Received data:', { pulpit_name, faculty_id });
    try {
        const result = await sql.query`
            INSERT INTO Pulpit (pulpit_name, faculty_id)
            VALUES (${pulpit_name}, ${faculty_id})
            SELECT * FROM Pulpit WHERE pulpit_name = ${pulpit_name} AND faculty_id = ${faculty_id}
        `;
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error during INSERT operation:', error);
        res.status(500).json({ error: 'Ошибка добавления кафедры' });
    }
});

app.post('/api/subjects', async (req, res) => {
    const { subject_name, pulpit_id } = req.body; 
    console.log('Received data:', { subject_name, pulpit_id });
    try {
        const result = await sql.query`
            INSERT INTO Subject (subject_name, pulpit_id) 
            VALUES (${subject_name}, ${pulpit_id})
            SELECT * FROM Subject WHERE subject_name = ${subject_name} AND pulpit_id = ${pulpit_id}
        `;
        res.json(result.recordset[0]);  
    } catch (error) {
        console.error('Ошибка при добавлении дисциплины:', error);
        res.status(500).json({ error: 'Ошибка добавления дисциплины' });
    }
});

app.post('/api/auditoriumstypes', async (req, res) => {
    const { auditorium_type_name } = req.body; 
    console.log('Received data:', { auditorium_type_name});
    try {
        const result = await sql.query`
            INSERT INTO Auditorium_Type (auditorium_type_name) 
            VALUES (${auditorium_type_name})
            SELECT * FROM Auditorium_Type WHERE auditorium_type_name = ${auditorium_type_name}
        `;
        res.json(result.recordset[0]); 
    } catch (error) {
        console.error('Ошибка при добавлении типа аудитории:', error);
        res.status(500).json({ error: 'Ошибка добавления типа аудитории' });
    }
});

app.post('/api/auditoriums', async (req, res) => {
    const { auditorium_name, auditorium_capacity, auditorium_type_id } = req.body;
    console.log('Received data:', { auditorium_name, auditorium_capacity, auditorium_type_id });
    try {
        let typeId = auditorium_type_id;
        if (isNaN(typeId)) {
            const typeResult = await sql.query`
                SELECT auditorium_type_id 
                FROM Auditorium_Type 
                WHERE auditorium_type_name = ${typeId}
            `;
            if (typeResult.recordset.length === 0) {
                return res.status(400).json({ error: 'Неверный тип аудитории' });
            }
            typeId = typeResult.recordset[0].auditorium_type_id;
        }
        const result = await sql.query`
            INSERT INTO Auditorium (auditorium_name, auditorium_capacity, auditorium_type_id) 
            VALUES (${auditorium_name}, ${auditorium_capacity}, ${typeId})
            SELECT * FROM Auditorium WHERE auditorium_name = ${auditorium_name} AND auditorium_capacity = ${auditorium_capacity} AND auditorium_type_id = ${typeId}
        `;
        res.json(result.recordset[0]); 
    } catch (error) {
        console.error('Ошибка при добавлении аудитории:', error);
        res.status(500).json({ error: 'Ошибка добавления аудитории' });
    }
});

app.put('/api/faculties', async (req, res) => {
    const { faculty_id, faculty_name } = req.body;
    try {
        const result = await sql.query`
            UPDATE Faculty 
            SET faculty_name = ${faculty_name} 
            WHERE faculty_id = ${faculty_id}
            SELECT * FROM Faculty WHERE faculty_id = ${faculty_id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Факультет не найден' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Ошибка при обновлении факультета:', error);
        res.status(500).json({ error: 'Ошибка обновления факультета' });
    }
});

app.put('/api/pulpits', async (req, res) => {
    const { pulpit_id, pulpit_name, faculty_id } = req.body;
    try {
        const result = await sql.query`
            UPDATE Pulpit
            SET pulpit_name = ${pulpit_name}, faculty_id = ${faculty_id}
            WHERE pulpit_id = ${pulpit_id}
            SELECT * FROM Pulpit WHERE pulpit_id = ${pulpit_id}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Кафедра не найдена' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления кафедры' });
    }
});

app.put('/api/subjects', async (req, res) => {
    const { subject_id, subject_name, pulpit_id } = req.body;
    try {
        const result = await sql.query`
            UPDATE Subject 
            SET subject_name = ${subject_name}, pulpit_id = ${pulpit_id}
            WHERE subject_id = ${subject_id}
            SELECT * FROM Subject WHERE subject_id = ${subject_id}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Дисциплина не найдена' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Ошибка при обновлении дисциплины:', error);
        res.status(500).json({ error: 'Ошибка обновления дисциплины' });
    }
});

app.put('/api/auditoriumstypes', async (req, res) => {
    const { auditorium_type_id, auditorium_type_name } = req.body;
    try {
        const result = await sql.query`
            UPDATE Auditorium_Type 
            SET auditorium_type_name = ${auditorium_type_name}
            WHERE auditorium_type_id = ${auditorium_type_id}
            SELECT * FROM Auditorium_Type WHERE auditorium_type_id = ${auditorium_type_id}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Тип аудитории не найден' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Ошибка при обновлении типа аудитории:', error);
        res.status(500).json({ error: 'Ошибка обновления типа аудитории' });
    }
});

app.put('/auditoriums', async (req, res) => {
    const { auditorium_id, auditorium_name, auditorium_capacity, auditorium_type_id } = req.body;
    try {
        const checkResult = await sql.query`
            SELECT * FROM Auditorium WHERE auditorium_id = ${auditorium_id}
        `;
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Аудитория не найдена' });
        }
        let typeId = auditorium_type_id;
        if (isNaN(typeId)) {
            const typeResult = await sql.query`
                SELECT auditorium_type_id FROM Auditorium_Type WHERE auditorium_type_name = ${typeId}
            `;
            if (typeResult.recordset.length === 0) {
                return res.status(400).json({ error: 'Неверный тип аудитории' });
            }
            typeId = typeResult.recordset[0].auditorium_type_id;
        }
        const updateResult = await sql.query`
            UPDATE Auditorium 
            SET auditorium_name = ${auditorium_name}, auditorium_capacity = ${auditorium_capacity}, auditorium_type_id = ${typeId}
            WHERE auditorium_id = ${auditorium_id}
            SELECT * FROM Auditorium WHERE auditorium_id = ${auditorium_id}
        `;
        res.json(updateResult.recordset[0]);
    } catch (error) {
        console.error('Ошибка при обновлении аудитории:', error);
        res.status(500).json({ error: 'Ошибка обновления аудитории' });
    }
});

app.delete('/api/faculties/:id', async (req, res) => {
    try {
        const result = await sql.query`
            DELETE FROM Faculty WHERE faculty_id = ${req.params.id}
            SELECT * FROM Faculty WHERE faculty_id = ${req.params.id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Факультет не найден' });
        }
        res.json({ message: 'Факультет удалён' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления факультета' });
    }
});

app.delete('/api/pulpits/:id', async (req, res) => {
    const pulpit_id = req.params.id; 
    try {
        const result = await sql.query`
            DELETE FROM Pulpit WHERE pulpit_id = ${pulpit_id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Кафедра не найдена' });
        }
        res.json({ message: 'Кафедра успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении кафедры:', error);
        res.status(500).json({ error: 'Ошибка удаления кафедры' });
    }
});

app.delete('/api/subjects/:id', async (req, res) => {
    const subject_id = req.params.id; 
    try {
        const result = await sql.query`
            DELETE FROM Subject WHERE subject_id = ${subject_id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Дисциплина не найдена' });
        }
        res.json({ message: 'Дисциплина успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении дисциплины:', error);
        res.status(500).json({ error: 'Ошибка удаления дисциплины' });
    }
});

app.delete('/api/auditoriumtypes/:id', async (req, res) => {
    const auditoriumTypeId = parseInt(req.params.id, 10); 
    if (isNaN(auditoriumTypeId)) {
        return res.status(400).json({ error: 'Некорректный ID типа аудитории' });
    }
    try {
        const selectResult = await sql.query`
            SELECT * FROM Auditorium_Type WHERE auditorium_type_id = ${auditoriumTypeId}
        `;
        if (selectResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Тип аудитории не найден' });
        }
        await sql.query`
            DELETE FROM Auditorium WHERE auditorium_type_id = ${auditoriumTypeId}
        `;
        await sql.query`
            DELETE FROM Auditorium_Type WHERE auditorium_type_id = ${auditoriumTypeId}
        `;
        res.json({ message: 'Aудитории успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении типа аудитории:', error);
        res.status(500).json({ error: 'Ошибка удаления типа аудитории' });
    }
});

app.delete('/api/auditoriums/:id', async (req, res) => {
    const auditorium_id = req.params.id; 
    try {
        const result = await sql.query`
            DELETE FROM Auditorium WHERE auditorium_id = ${auditorium_id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Дисциплина не найдена' });
        }
        res.json({ message: 'Аудитория успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении аудитории:', error);
        res.status(500).json({ error: 'Ошибка удаления аудитории' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});