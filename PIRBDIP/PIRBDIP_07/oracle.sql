-- Create tables
create table customer (
id number generated always as identity primary key,
name nvarchar2(100) not null,
email nvarchar2(100) not null,
password nvarchar2(100) not null,
constraint customer_email_unique unique (email)
);

create table administrator (
id number primary key,
name nvarchar2(100) not null,
email nvarchar2(100) not null,
password nvarchar2(100) not null,
constraint admin_email_unique unique (email)
);

create table seller (
id number primary key,
name nvarchar2(100) not null,
email nvarchar2(100) not null,
password nvarchar2(100) not null,
constraint seller_email_unique unique (email)
);

create table product (
id number primary key,
name nvarchar2(100) not null,
description nclob,
price number(10,2) not null,
seller_id number not null,
constraint fk_product_seller foreign key (seller_id) references seller(id)
);

create table orders (
id number primary key,
customer_id number not null,
order_date timestamp default systimestamp,
status nvarchar2(50) not null,
constraint fk_order_customer foreign key (customer_id) references customer(id)
);

create table order_product (
order_id number not null,
product_id number not null,
product_name nvarchar2(100) not null,
quantity number default 1,
constraint pk_order_product primary key (order_id,product_id),
constraint fk_order_product_order foreign key (order_id) references orders(id),
constraint fk_order_product_product foreign key (product_id) references product(id),
constraint chk_quantity_positive check (quantity>0)
);

delete from order_product;
delete from orders;
delete from product;
delete from customer;
delete from seller;
delete from administrator;

insert into administrator(id,name,email,password)values(1,'admin ivanov','admin1@example.com','password123');
insert into administrator(id,name,email,password)values(2,'admin petrov','admin2@example.com','password123');

insert into seller(id,name,email,password)values(1,'seller smirnov','seller1@example.com','password123');
insert into seller(id,name,email,password)values(2,'seller kuznetsov','seller2@example.com','password123');
insert into seller(id,name,email,password)values(3,'seller popov','seller3@example.com','password123');
insert into seller(id,name,email,password)values(4,'seller vasiliev','seller4@example.com','password123');
insert into seller(id,name,email,password)values(5,'seller petrov','seller5@example.com','password123');
insert into seller(id,name,email,password)values(6,'seller sokolov','seller6@example.com','password123');
insert into seller(id,name,email,password)values(7,'seller mikhailov','seller7@example.com','password123');
insert into seller(id,name,email,password)values(8,'seller novikov','seller8@example.com','password123');
insert into seller(id,name,email,password)values(9,'seller fedorov','seller9@example.com','password123');
insert into seller(id,name,email,password)values(10,'seller morozov','seller10@example.com','password123');
insert into seller(id,name,email,password)values(11,'seller volkov','seller11@example.com','password123');
insert into seller(id,name,email,password)values(12,'seller alekseev','seller12@example.com','password123');
insert into seller(id,name,email,password)values(13,'seller lebedev','seller13@example.com','password123');
insert into seller(id,name,email,password)values(14,'seller semenov','seller14@example.com','password123');
insert into seller(id,name,email,password)values(15,'seller egorov','seller15@example.com','password123');
insert into seller(id,name,email,password)values(16,'seller pavlov','seller16@example.com','password123');
insert into seller(id,name,email,password)values(17,'seller kozlov','seller17@example.com','password123');
insert into seller(id,name,email,password)values(18,'seller stepanov','seller18@example.com','password123');
insert into seller(id,name,email,password)values(19,'seller nikolaev','seller19@example.com','password123');
insert into seller(id,name,email,password)values(20,'seller orlov','seller20@example.com','password123');

begin
for i in 1..100 loop
insert into customer(name,email,password)values('customer '||i,'customer'||i||'@example.com','password'||i);
end loop;
commit;
end;
/

begin
for j in 1..200 loop
declare
v_seller_id number:=floor(dbms_random.value(1,21));
v_price number(10,2):=round(dbms_random.value(10,1000),2);
begin
insert into product(id,name,description,price,seller_id)values(j,'product '||j,'description for product '||j,v_price,v_seller_id);
end;
end loop;
commit;
end;
/

create global temporary table temporders (
temp_id number,
customer_id number,
order_date timestamp,
status nvarchar2(50)
) on commit preserve rows;

begin
for k in 1..500 loop
declare
v_customer_id number:=floor(dbms_random.value(1,101));
v_order_date timestamp:=systimestamp-dbms_random.value(0,730);
v_status_rand number:=dbms_random.value;
v_status nvarchar2(50);
begin
if v_status_rand<0.7 then v_status:='completed';
elsif v_status_rand<0.9 then v_status:='processing';
else v_status:='cancelled';
end if;
insert into temporders(temp_id,customer_id,order_date,status)values(k,v_customer_id,v_order_date,v_status);
end;
end loop;
commit;
end;
/

insert into orders(id,customer_id,order_date,status)select temp_id,customer_id,order_date,status from temporders;

begin
for m in 1..500 loop
declare
v_product_count number:=floor(dbms_random.value(1,6));
v_used_products sys.odcinumberlist:=sys.odcinumberlist();
begin
for n in 1..v_product_count loop
declare
v_product_id number;
v_quantity number;
v_product_name nvarchar2(100);
v_attempts number:=0;
v_max_attempts number:=10;
v_found boolean:=false;
v_product_exists boolean;
begin
while not v_found and v_attempts<v_max_attempts loop
v_attempts:=v_attempts+1;
v_product_id:=floor(dbms_random.value(1,201));
v_quantity:=floor(dbms_random.value(1,6));
v_product_exists:=false;
for i in 1..v_used_products.count loop
if v_used_products(i)=v_product_id then
v_product_exists:=true;
exit;
end if;
end loop;
if not v_product_exists then
begin
select name into v_product_name from product where id=v_product_id;
v_found:=true;
v_used_products.extend;
v_used_products(v_used_products.last):=v_product_id;
insert into order_product(order_id,product_id,product_name,quantity)values(m,v_product_id,v_product_name,v_quantity);
exception
when no_data_found then null;
end;
end if;
end loop;
end;
end loop;
end;
end loop;
commit;
end;
/

drop table temporders;

select * from administrator;
select * from customer;
select * from order_product;
select * from orders;
select * from product;
select * from seller;



-- —начала очистить таблицу
TRUNCATE TABLE temporders;

-- «атем удалить
DROP TABLE temporders;

drop table administrator;
drop table customer;
drop table order_product;
drop table orders;
drop table product;
drop table seller;



--1.	ѕостройте при помощи конструкции MODEL запросы, которые разрабатывают план: 
--продаж дл€ каждого сотрудника на следующий год, увеличива€ продажи 0.5% каждый мес€ц от предыдущего
with seller_monthly_sales as (
select s.id as seller_id,s.name as seller_name,extract(year from o.order_date) as year,extract(month from o.order_date) as month,sum(p.price * op.quantity) as sales_amount
from seller s
join product p on s.id = p.seller_id
join order_product op on p.id = op.product_id
join orders o on op.order_id = o.id
where o.status = 'completed'
group by s.id, s.name, extract(year from o.order_date), extract(month from o.order_date)
),
seller_avg_sales as (
select s.id as seller_id,s.name as seller_name,avg(p.price * op.quantity) as avg_sales
from seller s
join product p on s.id = p.seller_id
join order_product op on p.id = op.product_id
join orders o on op.order_id = o.id
where o.status = 'completed'
group by s.id, s.name
),
seller_base_sales as (
select s.id as seller_id,s.name as seller_name,nvl(avg(ss.sales_amount), sa.avg_sales) as base_sales
from seller s
left join seller_monthly_sales ss on s.id = ss.seller_id
left join seller_avg_sales sa on s.id = sa.seller_id
group by s.id, s.name, sa.avg_sales
)
select seller_id,seller_name,plan_year,month,round(monthly_plan, 2) as monthly_plan
from (
select seller_id,seller_name,extract(year from add_months(sysdate, 12)) as plan_year,level as month,base_sales,0 as monthly_plan
from seller_base_sales
connect by 
level <= 12 and
prior seller_id = seller_id and
prior sys_guid() is not null
)
model
partition by (seller_id, seller_name)
dimension by (month)
measures (plan_year, base_sales, monthly_plan)
rules (
monthly_plan[1] = base_sales[1],
monthly_plan[month > 1] = monthly_plan[cv()-1] * 1.005
)
order by seller_id, month;
--2.	Ќайдите при помощи конструкции MATCH_RECOGNIZE() данные, которые соответствуют шаблону: 
--–ост, падение, рост продаж дл€ каждого вида товара
select * from (
select p.id as product_id,p.name as product_name,trunc(o.order_date, 'MM') as sales_month,sum(op.quantity) as total_quantity from order_product op
join orders o on op.order_id = o.id
join product p on op.product_id = p.id
where o.status = 'completed'
group by p.id, p.name, trunc(o.order_date, 'MM')
) 
match_recognize (
partition by product_id
order by sales_month
measures 
strt.sales_month as start_month,
a.sales_month as peak_month,
b.sales_month as dip_month,
c.sales_month as rebound_month,
strt.total_quantity as q1,
a.total_quantity as q2,
b.total_quantity as q3,
c.total_quantity as q4
one row per match
pattern (strt a b c)
define
a as a.total_quantity > strt.total_quantity,
b as b.total_quantity < a.total_quantity,
c as c.total_quantity > b.total_quantity
);

