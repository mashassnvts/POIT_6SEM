const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const sql = require('mssql');
const app = express();


const dbConfig = {
  user: 'masha',
    password: 'qq',
    server: '127.0.0.1',
    database: 'SMI16', 
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

poolConnect.catch(err => {
  console.error('Ошибка подключения к базе данных:', err);
});

const schema = buildSchema(`
  type Faculty {
    FACULTY: String!
    FACULTY_NAME: String!
  }

  type Pulpit {
    PULPIT: String!
    PULPIT_NAME: String!
    FACULTY: String!
  }

  type Teacher {
    TEACHER: String!
    TEACHER_NAME: String!
    PULPIT: String!
  }

  type Subject {
    SUBJECT: String!
    SUBJECT_NAME: String!
    PULPIT: String!
  }

  type TeachersByFaculty {
    FACULTY: String!
    TEACHERS: [Teacher]
  }

  type SubjectsByFaculty {
    PULPIT: String!
    PULPIT_NAME: String!
    FACULTY: String!
    SUBJECTS: [Subject]
  }

  type Query {
    getFaculties(FACULTY: String): [Faculty]
    getPulpits(PULPIT: String): [Pulpit]
    getTeachers(TEACHER: String): [Teacher]
    getSubjects(SUBJECT: String): [Subject]
    getTeachersByFaculty(FACULTY: String!): [TeachersByFaculty]
    getSubjectsByFaculties(FACULTY: String!): [SubjectsByFaculty]
  }

  type Mutation {
    setFaculty(FACULTY: String!, FACULTY_NAME: String!): Faculty
    setPulpit(PULPIT: String!, PULPIT_NAME: String!, FACULTY: String!): Pulpit
    setTeacher(TEACHER: String!, TEACHER_NAME: String!, PULPIT: String!): Teacher
    setSubject(SUBJECT: String!, SUBJECT_NAME: String!, PULPIT: String!): Subject
    delFaculty(FACULTY: String!): Faculty
    delPulpit(PULPIT: String!): Pulpit
    delTeacher(TEACHER: String!): Teacher
    delSubject(SUBJECT: String!): Subject
  }
`);

const root = {

  getFaculties: async ({ FACULTY }) => {
    await poolConnect;
    let query = 'SELECT * FROM FACULTY';
    if (FACULTY) query += ` WHERE FACULTY = '${FACULTY}'`;
    const result = await pool.request().query(query);
    return result.recordset;
  },

  getPulpits: async ({ PULPIT }) => {
    await poolConnect;
    let query = 'SELECT * FROM PULPIT';
    if (PULPIT) query += ` WHERE PULPIT = '${PULPIT}'`;
    const result = await pool.request().query(query);
    return result.recordset;
  },

  getTeachers: async ({ TEACHER }) => {
    await poolConnect;
    let query = 'SELECT * FROM TEACHER';
    if (TEACHER) query += ` WHERE TEACHER = '${TEACHER}'`;
    const result = await pool.request().query(query);
    return result.recordset;
  },

  getSubjects: async ({ SUBJECT }) => {
    await poolConnect;
    let query = 'SELECT * FROM SUBJECT';
    if (SUBJECT) query += ` WHERE SUBJECT = '${SUBJECT}'`;
    const result = await pool.request().query(query);
    return result.recordset;
  },

  getTeachersByFaculty: async ({ FACULTY }) => {
    await poolConnect;
    console.log(`Executing query for faculty: ${FACULTY}`);
    const query = `
      SELECT t.TEACHER, t.TEACHER_NAME, p.PULPIT, p.FACULTY
      FROM TEACHER t
      JOIN PULPIT p ON t.PULPIT = p.PULPIT
      WHERE p.FACULTY = '${FACULTY}'
    `;
    const result = await pool.request().query(query);
    console.log('Query result:', result.recordset);
    return result.recordset.length
      ? [{ FACULTY, TEACHERS: result.recordset }]
      : [{ FACULTY, TEACHERS: [] }];
  }
  ,
  

  getSubjectsByFaculties: async ({ FACULTY }) => {
    await poolConnect;
    const query = `
      SELECT s.*, p.PULPIT_NAME, p.FACULTY
      FROM SUBJECT s
      JOIN PULPIT p ON s.PULPIT = p.PULPIT
      WHERE p.FACULTY = '${FACULTY}'
    `;
    const result = await pool.request().query(query);
    
    const grouped = {};
    result.recordset.forEach(subject => {
      if (!grouped[subject.PULPIT]) {
        grouped[subject.PULPIT] = {
          PULPIT: subject.PULPIT,
          PULPIT_NAME: subject.PULPIT_NAME,
          FACULTY: subject.FACULTY,
          SUBJECTS: []
        };
      }
      grouped[subject.PULPIT].SUBJECTS.push({
        SUBJECT: subject.SUBJECT,
        SUBJECT_NAME: subject.SUBJECT_NAME,
        PULPIT: subject.PULPIT
      });
    });
    
    return Object.values(grouped);
  },

  setFaculty: async ({ FACULTY, FACULTY_NAME }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM FACULTY WHERE FACULTY = '${FACULTY}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const updateQuery = `
        UPDATE FACULTY 
        SET FACULTY_NAME = '${FACULTY_NAME}'
        WHERE FACULTY = '${FACULTY}'
      `;
      await pool.request().query(updateQuery);
    } else {
      const insertQuery = `
        INSERT INTO FACULTY (FACULTY, FACULTY_NAME)
        VALUES ('${FACULTY}', '${FACULTY_NAME}')
      `;
      await pool.request().query(insertQuery);
    }
    
    return { FACULTY, FACULTY_NAME };
  },

  setPulpit: async ({ PULPIT, PULPIT_NAME, FACULTY }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM PULPIT WHERE PULPIT = '${PULPIT}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const updateQuery = `
        UPDATE PULPIT 
        SET PULPIT_NAME = '${PULPIT_NAME}', FACULTY = '${FACULTY}'
        WHERE PULPIT = '${PULPIT}'
      `;
      await pool.request().query(updateQuery);
    } else {
      const insertQuery = `
        INSERT INTO PULPIT (PULPIT, PULPIT_NAME, FACULTY)
        VALUES ('${PULPIT}', '${PULPIT_NAME}', '${FACULTY}')
      `;
      await pool.request().query(insertQuery);
    }
    
    return { PULPIT, PULPIT_NAME, FACULTY };
  },

  setTeacher: async ({ TEACHER, TEACHER_NAME, PULPIT }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM TEACHER WHERE TEACHER = '${TEACHER}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const updateQuery = `
        UPDATE TEACHER 
        SET TEACHER_NAME = '${TEACHER_NAME}', PULPIT = '${PULPIT}'
        WHERE TEACHER = '${TEACHER}'
      `;
      await pool.request().query(updateQuery);
    } else {
      const insertQuery = `
        INSERT INTO TEACHER (TEACHER, TEACHER_NAME, PULPIT)
        VALUES ('${TEACHER}', '${TEACHER_NAME}', '${PULPIT}')
      `;
      await pool.request().query(insertQuery);
    }
    
    return { TEACHER, TEACHER_NAME, PULPIT };
  },

  setSubject: async ({ SUBJECT, SUBJECT_NAME, PULPIT }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM SUBJECT WHERE SUBJECT = '${SUBJECT}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const updateQuery = `
        UPDATE SUBJECT 
        SET SUBJECT_NAME = '${SUBJECT_NAME}', PULPIT = '${PULPIT}'
        WHERE SUBJECT = '${SUBJECT}'
      `;
      await pool.request().query(updateQuery);
    } else {
      const insertQuery = `
        INSERT INTO SUBJECT (SUBJECT, SUBJECT_NAME, PULPIT)
        VALUES ('${SUBJECT}', '${SUBJECT_NAME}', '${PULPIT}')
      `;
      await pool.request().query(insertQuery);
    }
    
    return { SUBJECT, SUBJECT_NAME, PULPIT };
  },

  delFaculty: async ({ FACULTY }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM FACULTY WHERE FACULTY = '${FACULTY}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const deleteSubjectsQuery = `
        DELETE FROM SUBJECT 
        WHERE PULPIT IN (SELECT PULPIT FROM PULPIT WHERE FACULTY = '${FACULTY}')
      `;
      await pool.request().query(deleteSubjectsQuery);
      
      const deleteTeachersQuery = `
        DELETE FROM TEACHER 
        WHERE PULPIT IN (SELECT PULPIT FROM PULPIT WHERE FACULTY = '${FACULTY}')
      `;
      await pool.request().query(deleteTeachersQuery);
      
      const deletePulpitsQuery = `DELETE FROM PULPIT WHERE FACULTY = '${FACULTY}'`;
      await pool.request().query(deletePulpitsQuery);
      
      const deleteQuery = `DELETE FROM FACULTY WHERE FACULTY = '${FACULTY}'`;
      await pool.request().query(deleteQuery);
      
      return checkResult.recordset[0];
    }
    return null;
  },

  delPulpit: async ({ PULPIT }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM PULPIT WHERE PULPIT = '${PULPIT}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const deleteQuery = `DELETE FROM PULPIT WHERE PULPIT = '${PULPIT}'`;
      await pool.request().query(deleteQuery);
      return checkResult.recordset[0];
    }
    return null;
  },

  delTeacher: async ({ TEACHER }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM TEACHER WHERE TEACHER = '${TEACHER}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const deleteQuery = `DELETE FROM TEACHER WHERE TEACHER = '${TEACHER}'`;
      await pool.request().query(deleteQuery);
      return checkResult.recordset[0];
    }
    return null;
  },

  delSubject: async ({ SUBJECT }) => {
    await poolConnect;
    const checkQuery = `SELECT * FROM SUBJECT WHERE SUBJECT = '${SUBJECT}'`;
    const checkResult = await pool.request().query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      const deleteQuery = `DELETE FROM SUBJECT WHERE SUBJECT = '${SUBJECT}'`;
      await pool.request().query(deleteQuery);
      return checkResult.recordset[0];
    }
    return null;
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true 
}));


app.listen(3000, () => {
  console.log(`GraphQL сервер запущен на http://localhost:3000/graphql`);
});

process.on('SIGINT', async () => {
  await pool.close();
  process.exit();
});