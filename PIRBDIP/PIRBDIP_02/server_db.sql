create table customer (
id int identity(1000,10) primary key,
product_id int,
name varchar(100),
email varchar(255) unique,
password varchar(100),
constraint fk_customer_product foreign key (product_id) references product(id)
);

create table product (
id int identity(500,5) primary key,
name varchar(100),
description text,
price decimal(10,2),
seller_id int,
constraint fk_product_seller foreign key (seller_id) references seller(id)
);

create table orders (
id int identity(1,10) primary key,
customer_id int,
order_date datetime default getdate(),
status varchar(50),
constraint fk_order_customer foreign key (customer_id) references customer(id)
);

create table administrator (
id int identity(1,2) primary key,
name varchar(100),
email varchar(255) unique,
password varchar(100)
);

create table seller (
id int identity(100,7) primary key,
name varchar(100),
email varchar(255) unique,
password varchar(100)
);

insert into seller (name, email, password)
values ('john smith', 'john.seller@example.com', 'password123'),
('jane doe', 'jane.seller@example.com', 'securepass'),
('tech supplies', 'tech.seller@example.com', 'tech1234'),
('john smithh', 'john.sellerh@example.com', 'password123'),
('jane doeh', 'jane.sellerh@example.com', 'securepass'),
('tech suppliesh', 'tech.sellerh@example.com', 'tech1234');
insert into seller (name, email, password) values
('Seller 1', 'seller1@example.com', 'password1'),
('Seller 2', 'seller2@example.com', 'password2'),
('Seller 3', 'seller3@example.com', 'password3');
insert into product (name, description, price, seller_id) values
('монитор', '27-дюймовый монитор 4k', 499.99, 100),  
('laptop', 'high-performance laptop', 1200.50, 107), 
('smartphone', 'latest model smartphone', 799.99, 114),  
('headphones', 'wireless noise-cancelling headphones', 299.99, 100); 
insert into customer (product_id, name, email, password) values
(525, 'alice johnson', 'alice.customer@example.com', 'alice123'),  
(535, 'bob brown', 'bob.customer@example.com', 'bobsecure'),  
(550, 'charlie davis', 'charlie.customer@example.com', 'charliepass');  
insert into orders (customer_id, order_date, status) values
(1060, getdate(), 'pending'),  
(1080, getdate(), 'shipped'), 
(1070, getdate(), 'delivered');  



-- представление для всех заказов с информацией о клиентах и товарах
create view vw_orders as
select 
o.id as order_id,
c.name as customer_name,
p.name as product_name,
o.order_date,
o.status
from orders o
join customer c on o.customer_id = c.id
join product p on c.product_id = p.id;

create view vw_sellers_products as
select 
s.name as seller_name,
p.name as product_name,
p.price
from seller s join product p on s.id = p.seller_id;

create procedure addcustomer (
@p_name varchar(100),
@p_email varchar(255),
@p_password varchar(100),
@p_product_id int
)
as
begin
insert into customer (name, email, password, product_id)
values (@p_name, @p_email, @p_password, @p_product_id);
end;
go

create procedure updateorderstatus (
@p_order_id int,
@p_new_status varchar(50)
)
as
begin
update orders
set status = @p_new_status
where id = @p_order_id;
end;
go

create procedure deleteproduct (
@p_product_id int
)
as
begin
delete from product where id = @p_product_id;
end;
go

CREATE PROCEDURE dbo.addproduct (
@p_name VARCHAR(100),
@p_description TEXT,
@p_price DECIMAL(10,2),
@p_seller_id INT,
@new_product_id INT OUTPUT
)
AS
BEGIN
INSERT INTO product (name, description, price, seller_id)
VALUES (@p_name, @p_description, @p_price, @p_seller_id);
    
SET @new_product_id = SCOPE_IDENTITY();
END;
GO

drop procedure dbo.addproduct


create function getcustomerordertotal (
@p_customer_id int
)
returns decimal(10,2)
as
begin
declare @total decimal(10,2);
    
select @total = sum(p.price)
from orders o
join customer c on o.customer_id = c.id
join product p on c.product_id = p.id
where o.customer_id = @p_customer_id;

return isnull(@total, 0);
end;
go

create function sellerexists (
@p_email varchar(255)
)
returns bit
as
begin
declare @exists_flag bit;

select @exists_flag = case when count(*) > 0 then 1 else 0 end
from seller
where email = @p_email;

return @exists_flag;
end;
go


select * from customer where email = 'alice.customer@example.com';

exec addcustomer 'david wilson', 'david.customer@example.com', 'davidpass', 1;

insert into orders (customer_id, order_date, status)
values (1060, getdate(), 'pending');

exec updateorderstatus 111, 'shipffped';
select * from orders


exec deleteproduct 515;
select * from product;

select dbo.getcustomerordertotal(1070);
select * from customer;

select dbo.sellerexists('john.seller@example.com');

select * from vw_orders;
select * from vw_sellers_products;


INSERT INTO dbo.seller (name, email, password)
VALUES ('Example Seller', 'example@seller.com', 'password123');

DECLARE @new_product_id INT;

EXEC dbo.addproduct 
    @p_name = 'монитор',
    @p_description = '27-дюймовый монитор 4k',
    @p_price = 499.99,
    @p_seller_id = 100,  -- Use the correct seller_id
    @new_product_id = @new_product_id OUTPUT;

SELECT @new_product_id AS NewProductId;

SELECT * FROM dbo.seller WHERE id = 163;


-- Индекс для поля email в таблице Customer
CREATE INDEX idx_customer_email ON Customer(email);

-- Индекс для поля name в таблице Product
CREATE INDEX idx_product_name ON Product(name);

-- Индекс для поля status в таблице Orders
CREATE INDEX idx_order_status ON Orders(status);

-- Запрос, который должен использовать индекс по email
SELECT * FROM Customer WHERE email = 'alice.customer@example.com';

-- Запрос, который должен использовать индекс по имени продукта
SELECT * FROM Product WHERE name = 'монитор';

-- Запрос, который должен использовать индекс по статусу заказа
SELECT * FROM Orders WHERE status = 'pending';

