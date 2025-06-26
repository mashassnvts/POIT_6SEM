create table customer (
id int identity(1,1) primary key,
name nvarchar(100) not null,
email nvarchar(100) unique not null,
password nvarchar(100) not null
);
create table administrator (
id int primary key,
name nvarchar(100) not null,
email nvarchar(100) unique not null,
password nvarchar(100) not null
);

create table seller (
id int primary key,
name nvarchar(100) not null,
email nvarchar(100) unique not null,
password nvarchar(100) not null
);

create table product (
id int primary key,
name nvarchar(100) not null,
description nvarchar(max),
price decimal(10, 2) not null,
seller_id int not null,
constraint fk_product_seller foreign key (seller_id) references seller(id)
);


create table orders (
id int primary key,
customer_id int not null,
order_date datetime default sysdatetime(),
status nvarchar(50) not null,
constraint fk_order_customer foreign key (customer_id) references customer(id)
);

create table order_product (
order_id int not null,
product_id int not null,
product_name nvarchar(100) not null,
quantity int default 1 check (quantity > 0),
primary key (order_id, product_id),
constraint fk_order_product_order foreign key (order_id) references orders(id),
constraint fk_order_product_product foreign key (product_id) references product(id)
);

INSERT INTO administrator (id, name, email, password)
VALUES 
(1, 'Admin Ivanov', 'admin1@example.com', 'password123'),
(2, 'Admin Petrov', 'admin2@example.com', 'password123');

INSERT INTO seller (id, name, email, password)
VALUES 
(1, 'Seller Smirnov', 'seller1@example.com', 'password123'),
(2, 'Seller Kuznetsov', 'seller2@example.com', 'password123'),
(3, 'Seller Popov', 'seller3@example.com', 'password123'),
(4, 'Seller Vasiliev', 'seller4@example.com', 'password123'),
(5, 'Seller Petrov', 'seller5@example.com', 'password123'),
(6, 'Seller Sokolov', 'seller6@example.com', 'password123'),
(7, 'Seller Mikhailov', 'seller7@example.com', 'password123'),
(8, 'Seller Novikov', 'seller8@example.com', 'password123'),
(9, 'Seller Fedorov', 'seller9@example.com', 'password123'),
(10, 'Seller Morozov', 'seller10@example.com', 'password123'),
(11, 'Seller Volkov', 'seller11@example.com', 'password123'),
(12, 'Seller Alekseev', 'seller12@example.com', 'password123'),
(13, 'Seller Lebedev', 'seller13@example.com', 'password123'),
(14, 'Seller Semenov', 'seller14@example.com', 'password123'),
(15, 'Seller Egorov', 'seller15@example.com', 'password123'),
(16, 'Seller Pavlov', 'seller16@example.com', 'password123'),
(17, 'Seller Kozlov', 'seller17@example.com', 'password123'),
(18, 'Seller Stepanov', 'seller18@example.com', 'password123'),
(19, 'Seller Nikolaev', 'seller19@example.com', 'password123'),
(20, 'Seller Orlov', 'seller20@example.com', 'password123');

DECLARE @i INT = 1;
WHILE @i <= 100
BEGIN
INSERT INTO customer (name, email, password)
VALUES 
('Customer ' + CAST(@i AS NVARCHAR(10)), 'customer' + CAST(@i AS NVARCHAR(10)) + '@example.com', 'password' + CAST(@i AS NVARCHAR(10)));
SET @i = @i + 1;
END;

DECLARE @j INT = 1;
WHILE @j <= 200
BEGIN
DECLARE @seller_id INT = CAST(RAND() * 19 + 1 AS INT);
DECLARE @price DECIMAL(10,2) = CAST(RAND() * 990 + 10 AS DECIMAL(10,2));
    
INSERT INTO product (id, name, description, price, seller_id)
VALUES 
(@j, 
'Product ' + CAST(@j AS NVARCHAR(10)),
'Description for product ' + CAST(@j AS NVARCHAR(10)),
@price,
@seller_id);
SET @j = @j + 1;
END;
drop table TempOrders

CREATE TABLE #TempOrders (
    temp_id INT IDENTITY(1,1),
    customer_id INT,
    order_date DATETIME,
    status NVARCHAR(50)
);

DECLARE @k INT = 1;
DECLARE @order_date DATETIME;
DECLARE @customer_id INT;
DECLARE @status NVARCHAR(50);

WHILE @k <= 500
BEGIN
SET @customer_id = CAST(RAND() * 99 + 1 AS INT);
SET @order_date = DATEADD(DAY, -CAST(RAND() * 730 AS INT), GETDATE());

DECLARE @status_rand FLOAT = RAND();
IF @status_rand < 0.7 SET @status = 'Completed'
ELSE IF @status_rand < 0.9 SET @status = 'Processing'
ELSE SET @status = 'Cancelled'
    
INSERT INTO #TempOrders (customer_id, order_date, status)
VALUES (@customer_id, @order_date, @status);
    
SET @k = @k + 1;
END;

INSERT INTO orders (id, customer_id, order_date, status)
SELECT temp_id, customer_id, order_date, status FROM #TempOrders;

DECLARE @order_count INT = (SELECT COUNT(*) FROM #TempOrders);
DECLARE @m INT = 1;

WHILE @m <= @order_count
BEGIN
DECLARE @product_count INT = CAST(RAND() * 4 + 1 AS INT);
DECLARE @n INT = 1;
    
WHILE @n <= @product_count
BEGIN
DECLARE @product_id INT = CAST(RAND() * 199 + 1 AS INT);
DECLARE @quantity INT = CAST(RAND() * 4 + 1 AS INT);
        
DECLARE @product_name NVARCHAR(100);
SELECT @product_name = name FROM product WHERE id = @product_id;
        
INSERT INTO order_product (order_id, product_id, product_name, quantity)
VALUES 
(@m, @product_id, @product_name, @quantity);
        
SET @n = @n + 1;
END;
    
SET @m = @m + 1;
END;

DROP TABLE #TempOrders;



SELECT * FROM [dbo].[administrator];
SELECT * FROM[dbo].[customer]
SELECT * FROM[dbo].[order_product]
SELECT * FROM[dbo].[orders]
SELECT * FROM[dbo].[product]
SELECT * FROM[dbo].[seller]

drop table report;
drop procedure GenerateSalesReportXML;
drop procedure InsertReportXML;
drop procedure ExtractFromXML;

--1.	Создайте таблицу Report, содержащую два столбца – id и XML-столбец в базе данных SQL Server.
CREATE TABLE Report (
    id INT IDENTITY(1,1) PRIMARY KEY,
    xml_data XML NOT NULL
);
SELECT * FROM Report;
--2.	Создайте процедуру генерации XML. XML должен включать данные из как минимум 3 соединенных таблиц, различные промежуточные итоги и штамп времени.
CREATE PROCEDURE GenerateSalesReportXML
AS
BEGIN
    DECLARE @xml XML;
    
    SET @xml = (
        SELECT 
            o.id AS '@OrderID',
            o.order_date AS '@OrderDate',
            o.status AS '@Status',
            c.name AS 'Customer/@Name',
            c.email AS 'Customer/@Email',
            (
                SELECT 
                    p.name AS '@ProductName',
                    p.price AS '@Price',
                    op.quantity AS '@Quantity',
                    (p.price * op.quantity) AS '@Total'
                FROM order_product op
                JOIN product p ON op.product_id = p.id
                WHERE op.order_id = o.id
                FOR XML PATH('Product'), TYPE
            ) AS 'Products',
            (
                SELECT SUM(p.price * op.quantity)
                FROM order_product op
                JOIN product p ON op.product_id = p.id
                WHERE op.order_id = o.id
            ) AS 'OrderTotal',
            GETDATE() AS 'ReportTimestamp'
        FROM orders o
        JOIN customer c ON o.customer_id = c.id
        FOR XML PATH('Order'), ROOT('SalesReport')
    );
    
    SELECT @xml AS GeneratedXML;
END;

DECLARE @test_xml XML;
EXEC GenerateSalesReportXML;

--3.	Создайте процедуру вставки этого XML в таблицу Report.
CREATE PROCEDURE InsertReportXML
    @xml_data XML
AS
BEGIN
    INSERT INTO Report (xml_data)
    VALUES (@xml_data);
    
    SELECT SCOPE_IDENTITY() AS InsertedID;
END;

DECLARE @generated_xml XML;
DECLARE @inserted_id INT;
DECLARE @temp_table TABLE (test_xml XML);
INSERT INTO @temp_table EXEC GenerateSalesReportXML;
SELECT @generated_xml = test_xml FROM @temp_table;
EXEC InsertReportXML @xml_data = @generated_xml;

SELECT * FROM Report

DROP INDEX PXML_Report_xml_data ON Report;
DROP INDEX IXML_Report_Path ON Report;
--4.	Создайте индекс над XML-столбцом в таблице Report. 
CREATE PRIMARY XML INDEX PXML_Report_xml_data
ON Report(xml_data);

CREATE XML INDEX IXML_Report_Path
ON Report(xml_data)
USING XML INDEX PXML_Report_xml_data
FOR PATH;
SET STATISTICS IO ON;

DECLARE @search_value NVARCHAR(MAX) = NULL;

SELECT 
    id,
    xml_data.value('(//*[local-name()="Order"]/@Status)[1]', 'NVARCHAR(MAX)') AS ExtractedStatus
FROM Report r
WHERE @search_value IS NULL 
   OR r.xml_data.exist('//*[local-name()="Order"][@Status=sql:variable("@search_value")]') = 1;

SELECT i.name AS index_name,i.type_desc AS index_type
FROM sys.indexes i
JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name = 'Report' AND i.name IS NOT NULL;
--5.	Создайте процедуру извлечения значений элементов и/или атрибутов из XML -столбца в таблице Report (параметр – значение атрибута или элемента).
CREATE PROCEDURE ExtractFromXML
    @element_name NVARCHAR(100),
    @attribute_name NVARCHAR(100) = NULL,
    @search_value NVARCHAR(MAX) = NULL
AS
BEGIN
    IF @attribute_name IS NULL
    BEGIN
        SELECT 
            id,
            xml_data.value('(//*[local-name()=sql:variable("@element_name")])[1]', 'NVARCHAR(MAX)') AS ExtractedValue
        FROM Report
        WHERE @search_value IS NULL 
           OR xml_data.exist('//*[local-name()=sql:variable("@element_name")][.=sql:variable("@search_value")]') = 1;
    END
    ELSE
    BEGIN
        SELECT 
            id,
            xml_data.value('(//@*[local-name()=sql:variable("@attribute_name")])[1]', 'NVARCHAR(MAX)') AS ExtractedValue
        FROM Report
        WHERE @search_value IS NULL 
           OR xml_data.exist('//@*[local-name()=sql:variable("@attribute_name")][.=sql:variable("@search_value")]') = 1;
    END
END;

EXEC ExtractFromXML 
    @element_name = 'Order',
    @attribute_name = 'Status';

EXEC ExtractFromXML
    @element_name = 'Customer',
    @attribute_name = 'Email';

EXEC ExtractFromXML
    @element_name = 'OrderTotal';