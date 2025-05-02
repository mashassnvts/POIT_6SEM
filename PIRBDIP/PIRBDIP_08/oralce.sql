--2.	Создать объектные типы данных по своему варианту, реализовав:
--a.	Дополнительный конструктор;
--b.	Метод сравнения типа MAP или ORDER;
--c.	Функцию, как метод экземпляра;
--d.	Процедуру. как метод экземпляра.

drop table products_obj;
drop type product_type;

DROP TABLE products_obj;
DROP TYPE product_type;

drop table orders_obj;
drop type Order_Type;

drop sequence orders_obj_seq;
drop sequence products_obj_seq;


create or replace type product_type as object (
id number,
name nvarchar2(100),
description nclob,
price number(10,2),
seller_id number,
    
constructor function product_type(
p_name nvarchar2,
p_description nclob,
p_price number,
p_seller_id number
) return self as result,
map member function compare_price return number,
member function calculate_discount(p_percent number) return number DETERMINISTIC,
member procedure update_price(p_new_price number)
);
/
create or replace type body product_type as
constructor function product_type(
p_name nvarchar2,
p_description nclob,
p_price number,
p_seller_id number
) return self as result is
begin
self.id := -1;
self.name := p_name;
self.description := p_description;
self.price := p_price;
self.seller_id := p_seller_id;
return;
end;
    
map member function compare_price return number is
begin
return self.price;
end;
    
member function calculate_discount(p_percent number) return number DETERMINISTIC is
begin
if p_percent < 0 or p_percent > 100 then
raise_application_error(-20001, 'процент скидки должен быть между 0 и 100');
end if;
return self.price * (100 - p_percent) / 100;
end;
    
member procedure update_price(p_new_price number) is
begin
if p_new_price <= 0 then
raise_application_error(-20002, 'цена должна быть положительной');
end if;
self.price := p_new_price;
end;
end;
/

create table products_obj of product_type (
id primary key
) object identifier is primary key;

create sequence products_obj_seq start with 1 increment by 1;

declare
v_product1 product_type;
v_product2 product_type;
begin
v_product1 := product_type(
products_obj_seq.nextval,
'ноутбук', 
'мощный игровой ноутбук', 
1500.00, 
1
);
insert into products_obj values (v_product1);
    
v_product2 := product_type(
'смартфон',
'флагманский смартфон',
999.99,
2
);
v_product2.id := products_obj_seq.nextval;
insert into products_obj values (v_product2);
commit;
end;
/

select * from products_obj;

declare
v_product1 product_type;
v_product2 product_type;
v_new_product product_type;
begin
v_new_product := product_type(
'наушники',
'беспроводные наушники с шумоподавением',
299.99,
1
);
v_new_product.id := products_obj_seq.nextval;
insert into products_obj values (v_new_product);
commit;
    
select value(p) into v_product1 from products_obj p where p.id = 1;
select value(p) into v_product2 from products_obj p where p.id = 2;
    
dbms_output.put_line('сравнение цен:');
dbms_output.put_line(v_product1.name || ': ' || v_product1.compare_price());
dbms_output.put_line(v_product2.name || ': ' || v_product2.compare_price());
dbms_output.put_line('скидка 20% на ' || v_product1.name || ': ' || v_product1.calculate_discount(20));
dbms_output.put_line('обновление цены для ' || v_product2.name);
v_product2.update_price(v_product2.price * 1.1); 
update products_obj p set p.price = v_product2.price where p.id = 2;
commit;
dbms_output.put_line('новая цена: ' || v_product2.price);
end;
/


create or replace type order_type as object (
id number,
customer_id number,
order_date timestamp,
status nvarchar2(50),
    
constructor function order_type(
p_customer_id number,
p_status nvarchar2
) return self as result,
    
order member function compare_order_date(other order_type) return number,    
member function is_status_equal(p_status nvarchar2) return boolean,
member procedure update_status(p_new_status nvarchar2)
);
/

create or replace type body order_type as
constructor function order_type(
p_customer_id number,
p_status nvarchar2
) return self as result is
begin
self.id := null; 
self.customer_id := p_customer_id;
self.order_date := systimestamp; 
self.status := p_status;
return;
end;
    
order member function compare_order_date(other order_type) return number is
begin
if self.order_date < other.order_date then
return -1;
elsif self.order_date = other.order_date then
return 0;
else
return 1;
end if;
end;
    
member function is_status_equal(p_status nvarchar2) return boolean is
begin
return self.status = p_status;
end;
    
member procedure update_status(p_new_status nvarchar2) is
begin
if p_new_status is null or length(trim(p_new_status)) = 0 then
raise_application_error(-20003, 'статус не может быть пустым');
end if;
self.status := p_new_status;
end;
end;
/

create table orders_obj of order_type (
id primary key,
customer_id references customer(id)
);
select * from orders_obj

create sequence orders_obj_seq start with 1 increment by 1;
declare
v_order1 order_type;
v_order2 order_type;
v_new_order order_type;
v_customer_id number := 3; 
v_count number;
begin
select count(*) into v_count from orders_obj;

if v_count = 0 then
v_order1 := order_type(
orders_obj_seq.nextval,
3,
systimestamp - interval '1' day,
'новый'
);
insert into orders_obj values (v_order1);

v_order2 := order_type(
orders_obj_seq.nextval,
4,
systimestamp,
'в обработке'
);
insert into orders_obj values (v_order2);
commit;
dbms_output.put_line('добавлены заказы с id=' || v_order1.id || ' и id=' || v_order2.id);
end if;

v_new_order := order_type(
orders_obj_seq.nextval, 
v_customer_id,
systimestamp, 
'отменен'
);
insert into orders_obj values (v_new_order);
commit;
dbms_output.put_line('создан новый заказ с id: ' || v_new_order.id);

begin
select value(o) into v_order1 from orders_obj o where o.id = 1;
select value(o) into v_order2 from orders_obj o where o.id = 2;
exception
when no_data_found then
dbms_output.put_line('ошибка: не найдены тестовые заказы');
return;
end;

dbms_output.put_line('сравнение дат заказов:');
dbms_output.put_line('результат сравнения: ' || v_order1.compare_order_date(v_order2));
dbms_output.put_line('проверка статуса заказа 1 на "новый": ' || case when v_order1.is_status_equal('новый') then 'да' else 'нет' end);

dbms_output.put_line('обновление статуса заказа 2');
v_order2.update_status('возврат');
update orders_obj o set o.status = v_order2.status where o.id = v_order2.id;
commit;
dbms_output.put_line('новый статус: ' || v_order2.status);
end;
/

drop table products_rel
create table products_rel (
id number primary key,
name nvarchar2(100),
description nclob,
price number(10,2),
seller_id number
);

insert into products_rel values (7, 'Ноутбук', 'Игровой ноутбук', 1500.00, 1);
insert into products_rel values (8, 'Смартфон', 'Флагманский', 999.99, 2);
commit;

declare
v_product product_type;
begin
for r in (select * from products_rel) loop
v_product := product_type(
r.id,
r.name,
r.description,
r.price,
r.seller_id
);
insert into products_obj values (v_product);
end loop;
commit;
end;
/

select * from products_obj

drop table orders_rel
create table orders_rel (
id number primary key,
customer_id number references customer(id),
order_date timestamp,
status nvarchar2(50)
);

insert into orders_rel values (9, 3, systimestamp - 1, 'Новый');
insert into orders_rel values (10, 4, systimestamp, 'В обработке');
commit;

declare
v_order order_type;
begin
for r in (select * from orders_rel) loop
v_order := order_type(
r.id,
r.customer_id,
r.order_date,
r.status);
insert into orders_obj values (v_order);
end loop;
commit;
end;
/

select * from orders_obj;

create or replace view products_ov of product_type
with object identifier (id) as
select id, name, description, price, seller_id
from products_rel;

create or replace view orders_ov of order_type
with object identifier (id) as
select id, customer_id, order_date, status
from orders_rel;

declare
v_product product_type;
v_order order_type;
begin
v_product := product_type(
products_obj_seq.nextval,
'Планшет',
'10-дюймовый планшет с стилусом',
499.99,
3);
insert into products_ov values (v_product);
    
v_order := order_type(
orders_obj_seq.nextval,
3, 
systimestamp, 
'новый'
);
insert into orders_ov values (v_order);
commit;
dbms_output.put_line('данные успешно добавлены');
end;
/
select * from products_rel;
select * from orders_rel;

declare
v_product product_type;
v_order order_type;
begin
select value(p) into v_product from products_ov p where p.id = 7;
dbms_output.put_line('Информация о продукте:');
dbms_output.put_line('Название: ' || v_product.name);
dbms_output.put_line('Цена со скидкой 15%: ' || v_product.calculate_discount(15));
    
v_product.update_price(v_product.price * 0.9); 
update products_ov p set p.price = v_product.price where p.id = 7;
commit;
dbms_output.put_line('Цена продукта обновлена');
end;
/

declare
v_order1 order_type;
v_order2 order_type;
begin
select value(o) into v_order1 from orders_ov o where o.id = 9;
select value(o) into v_order2 from orders_ov o where o.id = 10;
dbms_output.put_line('сравнение дат заказов:');
dbms_output.put_line('результат: ' || v_order1.compare_order_date(v_order2));
if v_order1.is_status_equal('Новый') then
dbms_output.put_line('Заказ 9 имеет статус "Новый"');
end if;
end;
/



drop index idx_products_price
create index idx_products_price on products_obj (price);
select * from products_obj where price > 1000;




create or replace type test_item_type as object (
item_id number,
item_name varchar2(100),
base_price number(10,2),
creation_date date,
constructor function test_item_type(
p_id number,
p_name varchar2,
p_price number
) return self as result,
map member function get_sort_key return number deterministic,
member function calculate_discount(p_percent number) return number deterministic,
member function is_expired return boolean
);
/

create or replace type body test_item_type as
constructor function test_item_type(
p_id number,
p_name varchar2,
p_price number
) return self as result is
begin
self.item_id := p_id;
self.item_name := p_name;
self.base_price := p_price;
self.creation_date := sysdate;
return;
end;
  
map member function get_sort_key return number deterministic is
begin
return self.base_price;
end;
end;
/

create table test_items of test_item_type (
item_id primary key
);

create sequence test_items_seq start with 1 increment by 1;

insert into test_items values (test_item_type(test_items_seq.nextval, 'ноутбук', 1500.00));
insert into test_items values (test_item_type(test_items_seq.nextval, 'смартфон', 800.00));
insert into test_items values (test_item_type(test_items_seq.nextval, 'наушники', 200.00));
commit;

drop index idx_test_items_sort_key
create bitmap index idx_test_items_sort_key on test_items t (t.get_sort_key());

explain plan for
select * from test_items t 
where t.get_sort_key() between 500 and 1000
order by t.get_sort_key();
select * from table(dbms_xplan.display);

select item_name, base_price 
from test_items t
where t.get_sort_key() > 700;

