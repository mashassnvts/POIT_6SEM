-- ������� ��������
CREATE TABLE customer (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    password NVARCHAR(100) NOT NULL,
    CONSTRAINT customer_email_unique UNIQUE (email)
);

-- ������� ���������������
CREATE TABLE administrator (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    password NVARCHAR(100) NOT NULL,
    CONSTRAINT admin_email_unique UNIQUE (email)
);

-- ������� ���������
CREATE TABLE seller (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    password NVARCHAR(100) NOT NULL,
    CONSTRAINT seller_email_unique UNIQUE (email)
);

-- ������� �������
CREATE TABLE product (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL,
    seller_id INT NOT NULL,
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES seller(id)
);

CREATE TABLE product (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL,
    seller_id INT NOT NULL
);


-- ������� �������
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATETIME2 DEFAULT SYSDATETIME(),
    status NVARCHAR(50) NOT NULL,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- ������� ������� � �������
CREATE TABLE order_product (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name NVARCHAR(100) NOT NULL,
    quantity INT DEFAULT 1,
    CONSTRAINT pk_order_product PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_order_product_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_product_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0)
);

-- ���������� ������� customer (�������)
INSERT INTO customer (name, email, password) VALUES 
('������ �������', 'ivanov@example.com', 'pass123'),
('������� �����', 'petrova@example.com', 'qwerty456'),
('������� �������', 'sidorov@example.com', 'secure789'),
('��������� ����', 'kuznetsova@example.com', 'anna2023'),
('������� �����', 'smirnov@example.com', 'pavelpass');

-- ���������� ������� administrator (��������������)
INSERT INTO administrator VALUES 
(1, '����� �������', 'admin@store.com', 'admin123'),
(2, '��������� �������', 'moderator@store.com', 'mod456');

-- ���������� ������� seller (��������)
INSERT INTO seller VALUES 
(1, '��� ��������', 'tech@example.com', 'techpass1'),
(2, '�� ����������', 'books@example.com', 'bookpass2'),
(3, '�������', 'fashion@example.com', 'fashpass3'),
(4, '����������', 'gadgets@example.com', 'gadgetpass');

-- ���������� ������� product (������)
INSERT INTO product VALUES 
(101, '�������� X10', '������ �������� � ������� 48 ��', 29999.99, 1),
(102, '������� UltraBook', '������ � ���������������� �������', 64999.00, 1),
(201, '����� � ���', '����� �.�. �������� � ������� ���������', 1200.50, 2),
(202, 'SQL ��� ����������', '������� �� ����� ������', 2500.00, 2),
(301, '������ ������������', '����� ������ ������� ����', 4999.99, 3),
(302, '�������� ���������', '����� �������� �� 100% ������', 1999.00, 3),
(401, '����� ���� Pro', '������-������ � ������������', 8999.00, 4),
(402, '������������ ��������', '�������� � ���������������', 5999.50, 4);

-- ���������� ������� orders (������)
INSERT INTO orders (id, customer_id, order_date, status) VALUES 
(1001, 1, '2023-05-10 10:30:00', '��������'),
(1002, 2, '2023-05-15 14:45:00', '� ���������'),
(1003, 3, '2023-05-20 09:15:00', '���������'),
(1004, 1, '2023-06-01 16:20:00', '�����'),
(1005, 4, '2023-06-05 11:10:00', '� ���������'),
(1006, 5, GETDATE(), '�����');

-- ���������� ������� order_product (������ �������)
INSERT INTO order_product VALUES 
(1001, 101, '�������� X10', 1),
(1001, 401, '����� ���� Pro', 1),
(1002, 201, '����� � ���', 2),
(1002, 202, 'SQL ��� ����������', 1),
(1003, 301, '������ ������������', 1),
(1003, 302, '�������� ���������', 3),
(1004, 102, '������� UltraBook', 1),
(1005, 402, '������������ ��������', 2),
(1006, 101, '�������� X10', 1),
(1006, 402, '������������ ��������', 1);


drop function GetProductsAndOrdersInPeriod
--������� ��������� ������� ��� ������ ����������� ������ (��������� � ��� ����: ������ � ������ ������� �������, ������ � ��������� ������� �������, ������ ����� �� ������ �� ��������).
CREATE FUNCTION dbo.GetProductsAndOrdersInPeriod
(
@StartDate DATETIME2,
@EndDate DATETIME2
)
RETURNS @Result TABLE
(
OrderID INT,
OrderDate DATETIME2,
CustomerID INT,
ProductID INT,
ProductName NVARCHAR(100),
Quantity INT,
Price DECIMAL(10,2),
TotalPrice DECIMAL(10,2) 
)
AS
BEGIN
INSERT INTO @Result (OrderID, OrderDate, CustomerID, ProductID, ProductName, Quantity, Price, TotalPrice)
SELECT o.id AS OrderID,o.order_date AS OrderDate,o.customer_id AS CustomerID,op.product_id AS ProductID,op.product_name AS ProductName,op.quantity AS Quantity,p.price AS Price,p.price * op.quantity AS TotalPrice FROM orders o
INNER JOIN order_product op ON o.id = op.order_id
INNER JOIN product p ON op.product_id = p.id
WHERE o.order_date BETWEEN @StartDate AND @EndDate;
RETURN;
END;
GO
SELECT * FROM dbo.GetProductsAndOrdersInPeriod('2023-05-01', '2023-05-31');

select * from[dbo].[orders]

ALTER TABLE product
ALTER COLUMN description NVARCHAR(MAX);


BULK INSERT orders
FROM 'D:\masha\university\6_sem\PIRBDIP\PIRBDIP_11\orders.txt'
WITH (
FIELDTERMINATOR = ',',
ROWTERMINATOR = '\n',
FIRSTROW = 2
);

