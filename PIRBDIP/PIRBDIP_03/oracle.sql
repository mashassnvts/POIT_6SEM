create table customer (
id number primary key,
name varchar2(100) not null,
email varchar2(100) unique not null,
password varchar2(100) not null
);

create table product (
id number primary key,
name varchar2(100) not null,
description clob,
price number(10, 2) not null,
seller_id number not null,
constraint fk_product_seller foreign key (seller_id) references seller(id)
);

create table orders(
id number primary key,
customer_id number not null,
order_date timestamp default systimestamp,
status varchar2(50) not null,
constraint fk_order_customer foreign key (customer_id) references customer(id)
);

create table order_product (
order_id number not null,
product_id number not null,
product_name varchar2(100) not null,
quantity number default 1 check (quantity > 0),
primary key (order_id, product_id),
constraint fk_order_product_order foreign key (order_id) references orders(id),
constraint fk_order_product_product foreign key (product_id) references product(id)
);

create table administrator (
id number primary key,
name varchar2(100) not null,
email varchar2(100) unique not null,
password varchar2(100) not null
);

create table seller (
id number primary key,
name varchar2(100) not null,
email varchar2(100) unique not null,
password varchar2(100) not null
);

drop table orders;
drop table customer;
drop table product;
drop table order_product;
drop table seller;
drop table administrator;
--5.	Разработать для базы данных в СУБД Oracle решение для хранения иерархических данных с указанием родительского узла.
-- вставка новых данных
INSERT ALL
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (1, 'Electronics', 'Main category for electronics', 0, 1, '/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (2, 'Home Appliances', 'Main category for home appliances', 0, 2, '/2/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (3, 'Furniture', 'Main category for furniture', 0, 2, '/3/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (4, 'Clothing', 'Main category for clothing', 0, 1, '/4/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (5, 'Sports Equipment', 'Main category for sports equipment', 0, 2, '/5/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (6, 'Smartphone', 'Latest model smartphone', 699.99, 1, '/1/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (7, 'Laptop', 'High-performance laptop', 1299.99, 1, '/1/2/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (8, 'Headphones', 'Noise-canceling headphones', 199.99, 1, '/1/3/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (9, 'Smartwatch', 'Fitness and health smartwatch', 249.99, 1, '/1/4/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (10, 'Refrigerator', 'Energy-efficient refrigerator', 799.99, 2, '/2/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (11, 'Washing Machine', 'Front-load washing machine', 499.99, 2, '/2/2/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (12, 'Microwave', 'Compact microwave oven', 89.99, 2, '/2/3/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (13, 'Dishwasher', 'High-efficiency dishwasher', 649.99, 2, '/2/4/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (14, 'Sofa', 'Comfortable 3-seater sofa', 899.99, 1, '/3/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (15, 'Dining Table', 'Wooden dining table for 6 people', 499.99, 2, '/3/2/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (16, 'Bookshelf', 'Wooden bookshelf for living room', 129.99, 1, '/3/3/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (17, 'Coffee Table', 'Stylish coffee table for the living room', 169.99, 2, '/3/4/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (18, 'T-shirt', 'Comfortable cotton T-shirt', 19.99, 1, '/4/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (19, 'Jeans', 'Denim jeans for all seasons', 39.99, 1, '/4/2/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (20, 'Jacket', 'Leather jacket for winter', 129.99, 1, '/4/3/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (21, 'Sweater', 'Wool sweater for cold weather', 49.99, 2, '/4/4/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (22, 'Soccer Ball', 'Professional quality soccer ball', 29.99, 1, '/5/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (23, 'Tennis Racket', 'High-quality tennis racket', 149.99, 2, '/5/2/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (24, 'Basketball', 'Official size and weight basketball', 24.99, 1, '/5/3/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (25, 'Gym Equipment', 'Complete gym workout equipment set', 499.99, 2, '/5/4/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (26, 'Smartphone Case', 'Durable smartphone case', 29.99, 1, '/1/1/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (27, 'Laptop Charger', 'Replacement laptop charger', 49.99, 1, '/1/2/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (28, 'Bluetooth Headphones', 'Wireless Bluetooth headphones', 129.99, 1, '/1/3/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (29, 'Smartwatch Band', 'Replacement band for smartwatch', 19.99, 1, '/1/4/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (30, 'Washing Machine Detergent', 'Special detergent for washing machines', 15.99, 2, '/2/2/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (31, 'Dishwasher Tablets', 'Dishwasher cleaning tablets', 12.99, 2, '/2/4/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (32, 'Sofa Cushion', 'Replacement cushion for sofa', 49.99, 2, '/3/1/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (33, 'Dining Chair', 'Wooden dining chair for table', 59.99, 1, '/3/2/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (34, 'Bookshelf Organizer', 'Organize your bookshelf with new shelves', 29.99, 2, '/3/3/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (35, 'Coffee Table Set', 'Set of two stylish coffee tables', 199.99, 2, '/3/4/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (36, 'T-shirt Pack', 'Set of 3 cotton T-shirts', 49.99, 1, '/4/1/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (37, 'Jeans Collection', 'Set of 2 denim jeans', 69.99, 1, '/4/2/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (38, 'Jacket Liner', 'Inner lining for leather jacket', 59.99, 1, '/4/3/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (39, 'Sweater Vest', 'Wool sweater vest for layering', 39.99, 2, '/4/4/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (40, 'Soccer Net', 'Official soccer net for the field', 199.99, 2, '/5/1/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (41, 'Tennis Ball Pack', 'Pack of 3 professional tennis balls', 12.99, 2, '/5/2/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (42, 'Basketball Shoes', 'High-performance shoes for basketball', 89.99, 1, '/5/3/1/')
    INTO product (id, name, description, price, seller_id, HierarchyPath) VALUES (43, 'Gym Dumbbells', 'Set of 5kg to 20kg dumbbells', 299.99, 2, '/5/4/1/')
SELECT * FROM dual
commit;
--------------------------------------------------------------------------------
ALTER TABLE product
ADD HierarchyPath VARCHAR2(255);

select * from product;
drop procedure ShowSubNodes
-- 2. Процедура для отображения всех подчинённых узлов с указанием уровня иерархии.
create or replace procedure showsubnodes (p_node_id in number) is
v_level integer;
begin
for rec in (
select id, name, description, hierarchypath from product where hierarchypath like (select hierarchypath || '%' from product where id = p_node_id) and id != p_node_id
order by hierarchypath
) loop
v_level := length(rec.hierarchypath) - length(replace(rec.hierarchypath, '/', '')) - 1;
dbms_output.put_line('id: ' || rec.id || ', name: ' || rec.name || ', level: ' || v_level || ', hierarchypath: ' || rec.hierarchypath);
end loop;
end showsubnodes;
/
exec ShowSubNodes(2);
select id, name, HierarchyPath from product order by HierarchyPath;

drop procedure AddChildNode

--3.	Создать процедуру, которая добавит подчиненный узел (параметр – значение родительского узла).
create or replace procedure addchildnode(parent_id in number) is
parent_path varchar2(255);
new_id number;
new_name varchar2(100);
new_description clob;
new_price number(10, 2);
new_seller_id number;
begin
select hierarchyPath into parent_path from product where id = parent_id;
select nvl(max(id), 0) + 1 into new_id from product;
new_name := 'masha';
new_description := 'description of new product';
new_price := 99.99;  
new_seller_id := 1;  

insert into product (id, name, description, price, seller_id, hierarchyPath)
values (new_id, new_name, new_description, new_price, new_seller_id, parent_path || new_id || '/');

commit;
end addchildnode;
/
begin
  addchildnode(2);
end;

drop procedure move_children
--4.	Создать процедуру, которая переместит всех подчиненных (первый параметр – значение родительского узла, 
--подчиненные которого будут перемещаться, второй параметр – значение нового родительского узла).
create or replace procedure move_children(parent_id_from in number, parent_id_to in number) is
old_parent_path varchar2(255);
new_parent_path varchar2(255);
begin
select hierarchyPath into old_parent_path from product where id = parent_id_from;

select hierarchyPath into new_parent_path from product where id = parent_id_to;
if old_parent_path is not null and new_parent_path is not null then
update product
set hierarchyPath = replace(hierarchyPath, old_parent_path, new_parent_path)
where hierarchyPath like old_parent_path || '%';
commit;
else
raise_application_error(-20001, 'Один или оба родительских узла не существуют.');
end if;
end move_children;
/

begin
move_children(2, 4);
end;










