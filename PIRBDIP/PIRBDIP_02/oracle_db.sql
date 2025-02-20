--table
create table Customer(
id number primary key,
product_id number,
name varchar2(100),
email varchar2(255) unique,
password varchar2(100),
constraint fk_customer_product foreign key (product_id) references Product(id)
);

create table Product(
id number primary key,
name varchar2(100),
description clob,
price number(10,2),
seller_id number,
constraint fk_product_seller foreign key (seller_id) references Seller(id)
);
insert into Product (Id, Name, Description, Price, Seller_Id)
values (product_seq.nextval, 'Монитор', '27-дюймовый монитор 4K', 499.99, 1);

create table Orders(
id number primary key,
customer_id number,
order_date timestamp default current_timestamp,
status varchar2(50),
constraint fk_order_customer foreign key (customer_id) references Customer(id)
);

create table Administrator (
id number primary key,
name varchar2(100),
email varchar2(255) unique,
password varchar2(100)
);

create table Seller(
id number primary key,
name varchar2(100),
email varchar2(255) unique,
password varchar2(100)
);

--insert
insert into Seller (Id, Name, Email, Password)
values (seller_seq.nextval, 'John Smith', 'john.seller@example.com', 'password123');
insert into Seller (Id, Name, Email, Password)
values (seller_seq.nextval, 'Jane Doe', 'jane.seller@example.com', 'securepass');
insert into Seller (Id, Name, Email, Password)
values (seller_seq.nextval, 'Tech Supplies', 'tech.seller@example.com', 'tech1234');
insert into Seller (Id, Name, Email, Password)
values (1, 'John Smithh', 'john.sellerh@example.com', 'password123');
insert into Seller (Id, Name, Email, Password)
values (2, 'Jane Doeh', 'jane.sellerh@example.com', 'securepass');
insert into Seller (Id, Name, Email, Password)
values (3, 'Tech Suppliesh', 'tech.sellerh@example.com', 'tech1234');

insert into Product (Id, Name, Description, Price, Seller_Id)
values (2, 'Laptop', 'High-performance laptop', 1200.50, 1);
insert into Product (Id, Name, Description, Price, Seller_Id)
values (3, 'Smartphone', 'Latest model smartphone', 799.99, 2);
insert into Product (Id, Name, Description, Price, Seller_Id)
values (product_seq.nextval, 'Headphones', 'Wireless noise-cancelling headphones', 299.99, 3);
insert into Product (Id, Name, Description, Price, Seller_Id)
values (1, 'Laptop', 'High-performance laptop', 1200.50, 1);

insert into Customer (Id, Product_Id, Name, Email, Password)
values (customer_seq.nextval, 1, 'Alice Johnson', 'alice.customer@example.com', 'alice123');
insert into Customer (Id, Product_Id, Name, Email, Password)
values (customer_seq.nextval, 2, 'Bob Brown', 'bob.customer@example.com', 'bobsecure');
insert into Customer (Id, Product_Id, Name, Email, Password)
values (customer_seq.nextval, 3, 'Charlie Davis', 'charlie.customer@example.com', 'charliepass');

insert into Orders (Id, Customer_Id, Order_Date, Status)
values (1, 1040, SYSDATE, 'Pending');
insert into Orders (Id, Customer_Id, Order_Date, Status)
values (2, 1060, SYSDATE, 'Shipped');
insert into Orders (Id, Customer_Id, Order_Date, Status)
values (3, 1070, SYSDATE, 'Delivered');

insert into Administrator (Id, Name, Email, Password)
values (administator_seq.nextval, 'Admin1', 'admin1@example.com', 'adminpass1');
insert into Administrator (Id, Name, Email, Password)
values (administator_seq.nextval, 'Admin2', 'admin2@example.com', 'adminpass2');

--sequences
create sequence customer_seq 
start with 1000
increment by 10
minvalue 1000
maxvalue 999999
cache 20;

create sequence product_seq 
start with 500
increment by 5
minvalue 500
maxvalue 5000
cycle
cache 10;

create sequence order_seq 
start with 1
increment by 10
noorder
minvalue 1
maxvalue 1000000
nocycle
cache 20;

create sequence administator_seq 
start with 1
increment by 2
minvalue 1
maxvalue 100
nocycle
cache 5;

create sequence seller_seq 
start with 100
increment by 7
minvalue 100
maxvalue 99999
nocycle
cache 15;

--index
create index idx_customer_email on Customer(email);
create index idx_product_name on Product(name);
create index idx_order_status on Orders(status);

--view
-- Представление для всех заказов с информацией о клиентах и товарах
create view vw_orders as
select 
o.Id as Order_Id,
c.Name as Customer_Name,
p.Name as Product_Name,
o.Order_Date,
o.Status
from Orders o
join Customer c on o.Customer_Id = c.Id
join Product p on c.Product_Id = p.Id;

create view vw_sellers_products as
select 
s.Name as Seller_Name,
p.Name as Product_Name,
p.Price
from Seller s join Product p on s.Id = p.Seller_Id;

--procudure
create or replace procedure AddCustomer (
p_name in varchar2,
p_email in varchar2,
p_password in varchar2,
p_product_id in number
) as
begin
insert into Customer (Id, Name, Email, Password, Product_Id)
values (customer_seq.nextval, p_name, p_email, p_password, p_product_id);
commit;
end;
/

create or replace procedure UpdateOrderStatus (
p_order_id in number,
p_new_status in varchar2
) AS
begin
update orders
set Status = p_new_status
where Id = p_order_id;
commit;
end;
/

create or replace procedure DeleteProduct (
p_product_id IN number
) as
begin
delete from Product where Id = p_product_id;
commit;
end;
/

create or replace function AddProduct (
  p_name in varchar2,
  p_description in varchar2,
  p_price in number,
  p_seller_id in number
) return number is
  new_product_id number;
  
  -- Определяем автономную транзакцию
  pragma autonomous_transaction;
begin
  -- Вставляем новый продукт
  insert into Product (Id, Name, Description, Price, Seller_Id)
  values (product_seq.nextval, p_name, p_description, p_price, p_seller_id)
  returning Id into new_product_id;
  
  -- Подтверждаем изменения в автономной транзакции
  commit;
  
  -- Возвращаем ID нового продукта
  return new_product_id;
exception
  when others then
    -- В случае ошибки откатываем изменения в автономной транзакции
    rollback;
    return null;
end;
/


drop function AddProduct

--fuction
create or replace function GetCustomerOrderTotal (
p_customer_id in number
) return number is
total number;
begin
select sum(p.Price) into total from orders o
join Customer c on o.Customer_Id = c.Id
join Product p on c.Product_Id = p.Id
where o.Customer_Id = p_customer_id;

return NVL(total, 0);
end;
/

create or replace function SellerExists (
p_email in varchar2
) return number is
exists_flag number;
begin
select count(*) into exists_flag from Seller
where Email = p_email;

if exists_flag > 0 then
return 1;
else
return 0;
end if;
end;
/

--example
select * from Customer where email = 'alice.customer@example.com';

exec AddCustomer('David Wilson', 'david.customer@example.com', 'davidpass', 1);

exec UpdateOrderStatus(1, 'Завершен');
select * from orders;

exec DeleteProduct(525);
select * from product;

select GetCustomerOrderTotal(1070) from dual;
select * from customer;

select SellerExists('john.seller@example.com') from dual;

select * from vw_orders;
select * from vw_sellers_products;

select AddProduct('Монитор', '27-дюймовый монитор 4K', 499.99, 1) from dual;

