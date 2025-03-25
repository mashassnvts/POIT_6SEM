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


DELETE FROM order_product;
DELETE FROM orders;
DELETE FROM product;
DELETE FROM customer;
DELETE FROM seller;
DELETE FROM administrator;

SELECT * FROM [dbo].[administrator];
SELECT * FROM[dbo].[customer]
SELECT * FROM[dbo].[order_product]
SELECT * FROM[dbo].[orders]
SELECT * FROM[dbo].[product]
SELECT * FROM[dbo].[seller]


DBCC CHECKIDENT ('customer', RESEED, 0);
DBCC CHECKIDENT ('orders', RESEED, 0); 


INSERT INTO administrator (id, name, email, password)
VALUES 
(1, 'Admin Ivanov', 'admin1@example.com', 'password123'),
(2, 'Admin Petrov', 'admin2@example.com', 'password123');
)
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




--Вычисление итогов работы продавцов помесячно, за квартал, за полгода, за год.
WITH SalesData AS (
SELECT s.id AS seller_id,s.name AS seller_name,YEAR(o.order_date) AS year,MONTH(o.order_date) AS month,DATEPART(QUARTER, o.order_date) AS quarter,SUM(p.price * op.quantity) AS sales_amount
FROM seller s
JOIN product p ON s.id = p.seller_id
JOIN order_product op ON p.id = op.product_id
JOIN orders o ON op.order_id = o.id
WHERE o.status = 'Completed'
GROUP BY s.id, s.name, YEAR(o.order_date), MONTH(o.order_date), DATEPART(QUARTER, o.order_date)
)
SELECT seller_id,seller_name,year,month,quarter,sales_amount,SUM(sales_amount) OVER (PARTITION BY seller_id, year) AS yearly_sales,SUM(sales_amount) OVER (PARTITION BY seller_id, year, quarter) AS quarterly_sales,SUM(sales_amount) OVER (PARTITION BY seller_id, year, 
CASE WHEN month <= 6 THEN 1 ELSE 2 END) AS halfyearly_sales
FROM SalesData
ORDER BY seller_id, year, month;


--Вычисление итогов работы продавцов за определенный период:
--•	объем продаж;
--•	сравнение их с общим объемом продаж (в %);
--•	сравнение с наилучшим объемом продаж (в %).
WITH SalesData AS (
SELECT s.id AS seller_id,s.name AS seller_name,SUM(p.price * op.quantity) AS sales_volume,SUM(SUM(p.price * op.quantity)) OVER () AS total_sales,MAX(SUM(p.price * op.quantity)) OVER () AS best_sales
FROM seller s
JOIN product p ON s.id = p.seller_id
JOIN order_product op ON p.id = op.product_id
JOIN orders o ON op.order_id = o.id
WHERE o.status = 'Completed'
AND o.order_date BETWEEN '2023-01-01' AND '2024-12-31'
GROUP BY s.id, s.name
)
SELECT seller_id,seller_name,sales_volume AS "sales_volumes",
ROUND(sales_volume * 100.0 / NULLIF(total_sales, 0), 2) AS "% total_volume",
ROUND(sales_volume * 100.0 / NULLIF(best_sales, 0), 2) AS "% от best_volume"
FROM SalesData
ORDER BY sales_volume DESC;


--5.	Продемонстрируйте применение функции ранжирования ROW_NUMBER() для разбиения результатов запроса на страницы (по 20 строк на каждую страницу).
WITH PaginatedProducts AS (
SELECT p.id,p.name, p.price,s.name AS seller_name, ROW_NUMBER() OVER (ORDER BY p.id) AS row_num FROM product p
JOIN seller s ON p.seller_id = s.id
)
SELECT id, name, price, seller_name FROM PaginatedProducts
WHERE row_num BETWEEN 1 AND 20; 

--6.	Продемонстрируйте применение функции ранжирования ROW_NUMBER() для удаления дубликатов.???
BEGIN TRY
BEGIN TRANSACTION;
DELETE FROM order_product
WHERE order_id IN (
SELECT id FROM (
SELECT id, ROW_NUMBER() OVER (PARTITION BY customer_id, CAST(order_date AS DATE) ORDER BY id) AS row_num
FROM orders
) AS numbered WHERE row_num > 1
);
DELETE FROM orders
WHERE id IN (
SELECT id FROM (
SELECT id, ROW_NUMBER() OVER (PARTITION BY customer_id, CAST(order_date AS DATE) ORDER BY id) AS row_num
FROM orders
) AS numbered WHERE row_num > 1
);
COMMIT TRANSACTION;
PRINT 'удалено';
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
PRINT 'ошибка: ' + ERROR_MESSAGE();
END CATCH


--Вернуть для каждого клиента суммы последних 6 заказов
WITH CustomerOrderTotals AS (
SELECT c.id AS customer_id,c.name AS customer_name,o.id AS order_id,o.order_date,
SUM(p.price * op.quantity) AS order_total,
ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.order_date DESC) AS order_rank
FROM customer c
JOIN orders o ON c.id = o.customer_id
JOIN order_product op ON o.id = op.order_id
JOIN product p ON op.product_id = p.id
WHERE o.status = 'Completed'
GROUP BY c.id, c.name, o.id, o.order_date
)
SELECT customer_id,customer_name,
STRING_AGG(CAST(order_id AS NVARCHAR(10)) + ' (' + CAST(order_total AS NVARCHAR(20)) + ')', ', ') AS last_6_orders,
SUM(order_total) AS total_last_6_orders
FROM CustomerOrderTotals
WHERE order_rank <= 6
GROUP BY customer_id, customer_name;


--Какой сотрудник обслужил наибольшее число заказов определенного клиента? Вернуть для всех клиентов.
--Например, для данной таблицы в результирующем наборе будут только выделенные строки:
WITH CustomerSellerOrders AS (
SELECT c.id AS customer_id,c.name AS customer_name,p.seller_id,s.name AS seller_name,
COUNT(DISTINCT o.id) AS orders_count,
RANK() OVER (PARTITION BY c.id ORDER BY COUNT(DISTINCT o.id) DESC) AS seller_rank
FROM customer c
JOIN orders o ON c.id = o.customer_id
JOIN order_product op ON o.id = op.order_id
JOIN product p ON op.product_id = p.id
JOIN seller s ON p.seller_id = s.id
WHERE o.status = 'Completed'
GROUP BY c.id, c.name, p.seller_id, s.name
)
SELECT customer_id,customer_name,seller_id,seller_name,orders_count
FROM CustomerSellerOrders
WHERE seller_rank = 1
ORDER BY customer_id;

