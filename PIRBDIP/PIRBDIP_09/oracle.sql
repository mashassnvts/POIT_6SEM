-- Insert data into the seller table (assuming it exists)
INSERT INTO seller (id, name) VALUES (1, 'Seller A');
INSERT INTO seller (id, name) VALUES (2, 'Seller B');
-- Create the seller table
CREATE TABLE seller (
    id NUMBER PRIMARY KEY,
    name NVARCHAR2(100)
);
drop table seller;
drop table customer;
-- Create the customer table
CREATE TABLE customer (
    id NUMBER PRIMARY KEY,
    name NVARCHAR2(100),
    email NVARCHAR2(100)
);

-- Insert data into the customer table (assuming it exists)
INSERT INTO customer (id, name, email) VALUES (1, 'Customer 1', 'customer1@example.com');
INSERT INTO customer (id, name, email) VALUES (2, 'Customer 2', 'customer2@example.com');
INSERT INTO customer (id, name, email) VALUES (3, 'Customer 3', 'customer3@example.com');

-- Insert data into the products_tab table
INSERT INTO products_tab (id, name, description, price, seller_id) VALUES (1, 'Product A', 'Description of Product A', 25.50, 1);
INSERT INTO products_tab (id, name, description, price, seller_id) VALUES (2, 'Product B', 'Description of Product B', 50.00, 2);
INSERT INTO products_tab (id, name, description, price, seller_id) VALUES (3, 'Product C', 'Description of Product C', 100.75, 1);

-- Insert data into the orders_tab table
INSERT INTO orders_tab (id, customer_id, order_date, status) VALUES (1, 1, DATE '2025-05-01', 'Shipped');
INSERT INTO orders_tab (id, customer_id, order_date, status) VALUES (2, 2, DATE '2025-05-03', 'Pending');
INSERT INTO orders_tab (id, customer_id, order_date, status) VALUES (3, 1, DATE '2025-05-04', 'Delivered');

-- Insert data into the order_products_tab table
INSERT INTO order_products_tab (order_id, product_id, product_name, quantity) VALUES (1, 1, 'Product A', 2);
INSERT INTO order_products_tab (order_id, product_id, product_name, quantity) VALUES (1, 2, 'Product B', 1);
INSERT INTO order_products_tab (order_id, product_id, product_name, quantity) VALUES (2, 3, 'Product C', 1);
INSERT INTO order_products_tab (order_id, product_id, product_name, quantity) VALUES (3, 1, 'Product A', 1);
drop table order_products_tab cascade constraints;
drop table orders_tab cascade constraints;
drop table products_tab cascade constraints;
drop table customer;

drop type customer_orders_t;
drop type order_product_list_t;
drop type customer_list_t;
drop type customer_t;
drop type order_product_t;
drop type order_t;
drop type product_t;


create or replace type product_t as object (
id number,
name nvarchar2(100),
description nclob,
price number(10,2),
seller_id number
);
/ 

create or replace type order_t as object (
id number,
customer_id number,
order_date timestamp,
status nvarchar2(50)
);
/ 

create or replace type order_product_t as object (
order_id number,
product_id number,
product_name nvarchar2(100),
quantity number
);
/ 

create table products_tab of product_t (
constraint pk_product_tab primary key (id),
constraint fk_product_seller_tab foreign key (seller_id) references seller(id)
);

create table orders_tab of order_t (
constraint pk_order_tab primary key (id),
constraint fk_order_customer_tab foreign key (customer_id) references customer(id)
);

create table order_products_tab of order_product_t (
constraint pk_order_product_tab primary key (order_id, product_id),
constraint fk_order_product_order_tab foreign key (order_id) references orders_tab(id),
constraint fk_order_product_product_tab foreign key (product_id) references products_tab(id),
constraint chk_quantity_positive_tab check (quantity > 0)
);



--создать коллекцию k1 
create or replace type customer_t as object (
id number,
name nvarchar2(100),
email nvarchar2(100),
map member function to_map return varchar2
);
/ 

create or replace type body customer_t as 
map member function to_map return varchar2 is
begin
return name || email;
end;
end;
/

create or replace type customer_list_t as table of customer_t;
/ 

-- создать коллекцию k2 как вложенную коллекцию 
create or replace type order_product_list_t as table of order_product_t;
/ 

-- добавить k2 как атрибут в k1
create or replace type customer_orders_t as object (
customer_info customer_t,
orders order_product_list_t
);
/ 

--является ли элемент членом коллекции k1.
declare
v_customers customer_list_t;
v_target_customer customer_t := customer_t(1, 'Customer 1', 'customer1@example.com');
v_is_member boolean := false;
begin
select cast(collect(customer_t(id, name, email)) as customer_list_t) into v_customers from customer;
for i in 1..v_customers.count loop
if v_customers(i).to_map = v_target_customer.to_map then
v_is_member := true;
exit;
end if;
end loop;
if v_is_member then
dbms_output.put_line('customer is a member of the collection.');
else
dbms_output.put_line('customer is not a member of the collection.');
end if;
end;
/

--найти пустые коллекции k1
declare
v_customers customer_list_t;
begin
select cast(collect(customer_t(id, name, email)) as customer_list_t) into v_customers from customer;
if v_customers is null or v_customers.count = 0 then
dbms_output.put_line('the customer_list_t collection is empty.');
else
dbms_output.put_line('the customer_list_t collection is not empty. count = ' || v_customers.count);
end if;

end;
/


drop table some_temp_table ;

create global temporary table some_temp_table (
id number,
name nvarchar2(100),
email nvarchar2(100)
) on commit delete rows;

declare
v_customers customer_list_t;
begin
select cast(collect(customer_t(id, name, email)) as customer_list_t) into v_customers from customer;

for i in 1..v_customers.count loop
insert into some_temp_table (id, name, email) values (v_customers(i).id, v_customers(i).name, v_customers(i).email);
end loop;
commit;
end;
/

--применение bulk операций
declare
type customer_ids_t is table of customer.id%type;
v_customer_ids customer_ids_t;
begin
select id bulk collect into v_customer_ids from customer where rownum <= 10;
forall i in indices of v_customer_ids update customer set email = 'updated_' || email where id = v_customer_ids(i);
commit;
dbms_output.put_line('emails updated customers.');
end;
/
select * from customer;