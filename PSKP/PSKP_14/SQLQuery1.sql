CREATE DATABASE SMI;
GO

USE master;
GO
CREATE LOGIN qq WITH PASSWORD = '1111';
GO
USE SMI;
GO
CREATE USER masha FOR LOGIN qq;
GO
-- Даем права на базу данных
ALTER ROLE sss ADD MEMBER masha;
GO
SELECT name FROM sys.database_principals WHERE type = 'R' AND name = 'sss';

USE SMI;  -- Замените на имя вашей БД (XYZ)
GO
CREATE ROLE sss;
GO

ALTER ROLE sss ADD MEMBER masha;
GO

SELECT DISTINCT local_net_address, local_tcp_port 
FROM sys.dm_exec_connections 
WHERE local_net_address IS NOT NULL;

CREATE TABLE Faculty (
    faculty_id INT IDENTITY(1,1) PRIMARY KEY,
    faculty_name NVARCHAR(100) NOT NULL
);

CREATE TABLE Pulpit (
    pulpit_id INT IDENTITY(1,1) PRIMARY KEY,
    pulpit_name NVARCHAR(100) NOT NULL,
    faculty_id INT FOREIGN KEY REFERENCES Faculty(faculty_id)
);

CREATE TABLE Auditorium_Type (
    auditorium_type_id INT IDENTITY(1,1) PRIMARY KEY,
    auditorium_type_name NVARCHAR(100) NOT NULL
);

CREATE TABLE Subject (
    subject_id INT IDENTITY(1,1) PRIMARY KEY,
    subject_name NVARCHAR(100) NOT NULL,
    pulpit_id INT FOREIGN KEY REFERENCES Pulpit(pulpit_id)
);

CREATE TABLE Auditorium (
    auditorium_id INT IDENTITY(1,1) PRIMARY KEY,
    auditorium_name NVARCHAR(100) NOT NULL,
    auditorium_capacity INT NOT NULL,
    auditorium_type_id INT FOREIGN KEY REFERENCES Auditorium_Type(auditorium_type_id)
);

CREATE TABLE Teacher (
    teacher_id INT IDENTITY(1,1) PRIMARY KEY,
    teacher_name NVARCHAR(100) NOT NULL
);


INSERT INTO Faculty (faculty_name) VALUES 
('Факультет информационных технологий'),
('Инженерно-экономический факультет'),
('Факультет математики и физики'),
('Гуманитарный факультет'),
('Факультет биологии и химии');

INSERT INTO Pulpit (pulpit_name, faculty_id) VALUES 
('Кафедра информационных систем', 1),
('Кафедра программного обеспечения', 1),
('Кафедра экономики', 2),
('Кафедра менеджмента', 2),
('Кафедра высшей математики', 3),
('Кафедра теоретической физики', 3),
('Кафедра иностранных языков', 4),
('Кафедра биохимии', 5);

INSERT INTO Auditorium_Type (auditorium_type_name) VALUES 
('Лекционная'),
('Лаборатория'),
('Семинарская'),
('Компьютерный класс'),
('Специализированная');

INSERT INTO Subject (subject_name, pulpit_id) VALUES 
('Базы данных', 1),
('Программирование на Python', 2),
('Микроэкономика', 3),
('Теория управления', 4),
('Дифференциальные уравнения', 5),
('Квантовая механика', 6),
('Английский язык', 7),
('Биоорганическая химия', 8);

INSERT INTO Auditorium (auditorium_name, auditorium_capacity, auditorium_type_id) VALUES 
('101', 50, 1),
('102', 30, 2),
('201', 40, 1),
('202', 25, 3),
('301', 60, 1),
('302', 20, 4),
('401', 35, 5),
('402', 15, 2);

INSERT INTO Teacher (teacher_name) VALUES 
('Иванов Иван Иванович'),
('Петрова Светлана Михайловна'),
('Сидоров Алексей Петрович'),
('Кузнецова Ольга Владимировна'),
('Васильев Дмитрий Сергеевич'),
('Смирнова Анна Юрьевна'),
('Федоров Максим Андреевич'),
('Николаева Елена Дмитриевна');


SELECT * FROM Pulpit;
SELECT * FROM Auditorium;
SELECT * FROM Faculties;
SELECT * FROM Subjects;
SELECT * FROM Teacher;
SELECT * FROM Faculty WHERE faculty_id = 19;
INSERT INTO Faculty (faculty_id, faculty_name) VALUES (19, 'Факультет');




CREATE LOGIN masha WITH PASSWORD = 'qq';
USE SMI;
CREATE USER mash FOR LOGIN masha;
ALTER ROLE db_owner ADD MEMBER mash;