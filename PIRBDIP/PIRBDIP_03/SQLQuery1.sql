use masha;
SELECT SERVERPROPERTY('ProductVersion') AS 'SQL Server Version';

create table customer (
id int identity(1,1) primary key,
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

drop table orders;
drop table customer;
drop table product;
drop table order_product;
drop table seller;
drop table administrator;

select * from product

insert into customer (name, email, password) values ('jane smith', 'jane.smith@example.com', 'securepass');
insert into customer (name, email, password) values ('jane smith', 'jane.smithdf@example.com', 'securepууass');
insert into customer (name, email, password) values ('anya', 'jadsne.smith@example.com', 'seddcurepass');

select * from seller;
INSERT INTO product (id, name, description, price, seller_id, HierarchyPath)
VALUES 
(1, 'Electronics', 'Main category for electronics', 0, 1, hierarchyid::Parse('/1/')), 
(2, 'Home Appliances', 'Main category for home appliances', 0, 2, hierarchyid::Parse('/2/')), 
(3, 'Furniture', 'Main category for furniture', 0, 2, hierarchyid::Parse('/3/')), 
(4, 'Clothing', 'Main category for clothing', 0, 1, hierarchyid::Parse('/4/')), 
(5, 'Sports Equipment', 'Main category for sports equipment', 0, 2, hierarchyid::Parse('/5/')),
(6, 'Smartphone', 'Latest model smartphone', 699.99, 1, hierarchyid::Parse('/1/1/')), 
(7, 'Laptop', 'High-performance laptop', 1299.99, 1, hierarchyid::Parse('/1/2/')), 
(8, 'Headphones', 'Noise-canceling headphones', 199.99, 1, hierarchyid::Parse('/1/3/')), 
(9, 'Smartwatch', 'Fitness and health smartwatch', 249.99, 1, hierarchyid::Parse('/1/4/')), 
(10, 'Refrigerator', 'Energy-efficient refrigerator', 799.99, 2, hierarchyid::Parse('/2/1/')), 
(11, 'Washing Machine', 'Front-load washing machine', 499.99, 2, hierarchyid::Parse('/2/2/')), 
(12, 'Microwave', 'Compact microwave oven', 89.99, 2, hierarchyid::Parse('/2/3/')), 
(13, 'Dishwasher', 'High-efficiency dishwasher', 649.99, 2, hierarchyid::Parse('/2/4/')), 
(14, 'Sofa', 'Comfortable 3-seater sofa', 899.99, 1, hierarchyid::Parse('/3/1/')), 
(15, 'Dining Table', 'Wooden dining table for 6 people', 499.99, 2, hierarchyid::Parse('/3/2/')), 
(16, 'Bookshelf', 'Wooden bookshelf for living room', 129.99, 1, hierarchyid::Parse('/3/3/')), 
(17, 'Coffee Table', 'Stylish coffee table for the living room', 169.99, 2, hierarchyid::Parse('/3/4/')), 
(18, 'T-shirt', 'Comfortable cotton T-shirt', 19.99, 1, hierarchyid::Parse('/4/1/')), 
(19, 'Jeans', 'Denim jeans for all seasons', 39.99, 1, hierarchyid::Parse('/4/2/')), 
(20, 'Jacket', 'Leather jacket for winter', 129.99, 1, hierarchyid::Parse('/4/3/')), 
(21, 'Sweater', 'Wool sweater for cold weather', 49.99, 2, hierarchyid::Parse('/4/4/')), 
(22, 'Soccer Ball', 'Professional quality soccer ball', 29.99, 1, hierarchyid::Parse('/5/1/')), 
(23, 'Tennis Racket', 'High-quality tennis racket', 149.99, 2, hierarchyid::Parse('/5/2/')), 
(24, 'Basketball', 'Official size and weight basketball', 24.99, 1, hierarchyid::Parse('/5/3/')), 
(25, 'Gym Equipment', 'Complete gym workout equipment set', 499.99, 2, hierarchyid::Parse('/5/4/')),
(26, 'Smartphone Case', 'Durable smartphone case', 29.99, 1, hierarchyid::Parse('/1/1/1/')), 
(27, 'Laptop Charger', 'Replacement laptop charger', 49.99, 1, hierarchyid::Parse('/1/2/1/')), 
(28, 'Bluetooth Headphones', 'Wireless Bluetooth headphones', 129.99, 1, hierarchyid::Parse('/1/3/1/')), 
(29, 'Smartwatch Band', 'Replacement band for smartwatch', 19.99, 1, hierarchyid::Parse('/1/4/1/')), 
(30, 'Washing Machine Detergent', 'Special detergent for washing machines', 15.99, 2, hierarchyid::Parse('/2/2/1/')), 
(31, 'Dishwasher Tablets', 'Dishwasher cleaning tablets', 12.99, 2, hierarchyid::Parse('/2/4/1/')), 
(32, 'Sofa Cushion', 'Replacement cushion for sofa', 49.99, 2, hierarchyid::Parse('/3/1/1/')), 
(33, 'Dining Chair', 'Wooden dining chair for table', 59.99, 1, hierarchyid::Parse('/3/2/1/')), 
(34, 'Bookshelf Organizer', 'Organize your bookshelf with new shelves', 29.99, 2, hierarchyid::Parse('/3/3/1/')), 
(35, 'Coffee Table Set', 'Set of two stylish coffee tables', 199.99, 2, hierarchyid::Parse('/3/4/1/')), 
(36, 'T-shirt Pack', 'Set of 3 cotton T-shirts', 49.99, 1, hierarchyid::Parse('/4/1/1/')), 
(37, 'Jeans Collection', 'Set of 2 denim jeans', 69.99, 1, hierarchyid::Parse('/4/2/1/')), 
(38, 'Jacket Liner', 'Inner lining for leather jacket', 59.99, 1, hierarchyid::Parse('/4/3/1/')), 
(39, 'Sweater Vest', 'Wool sweater vest for layering', 39.99, 2, hierarchyid::Parse('/4/4/1/')), 
(40, 'Soccer Net', 'Official soccer net for the field', 199.99, 2, hierarchyid::Parse('/5/1/1/')), 
(41, 'Tennis Ball Pack', 'Pack of 3 professional tennis balls', 12.99, 2, hierarchyid::Parse('/5/2/1/')), 
(42, 'Basketball Shoes', 'High-performance shoes for basketball', 89.99, 1, hierarchyid::Parse('/5/3/1/')), 
(43, 'Gym Dumbbells', 'Set of 5kg to 20kg dumbbells', 299.99, 2, hierarchyid::Parse('/5/4/1/'));

insert into orders (id, customer_id, order_date, status) values (1, 1, sysdatetime(), 'created');
insert into orders (id, customer_id, order_date, status) values (2, 2, sysdatetime(), 'shipped');
insert into orders (id, customer_id, order_date, status) values (3, 3, sysdatetime(), 'created');
insert into orders (id, customer_id, order_date, status) values (4, 4, sysdatetime(), 'created');

insert into order_product (order_id, product_id, product_name, quantity) values (1, 1, 'laptop', 1);
insert into order_product (order_id, product_id, product_name, quantity) values (2, 2, 'smartphone', 2);
insert into order_product (order_id, product_id, product_name, quantity) values (4, 2, 'smartphone', 5);
insert into order_product (order_id, product_id, product_name, quantity) values (4, 2, 'smartphone', 3);

insert into administrator (id, name, email, password) values (1, 'admin user', 'admin@example.com', 'adminpass');
insert into seller (id, name, email, password) values (1, 'tech store', 'techstore@example.com', 'tech123');
insert into seller (id, name, email, password) values (2, 'gadget shop', 'gadgetshop@example.com', 'gadget456');


alter table product
add HierarchyPath hierarchyid;
select * from product
drop procedure showsubordinatenodes

select name, description, price, seller_id, HierarchyPath.ToString() as HierarchyPath,HierarchyPath.GetLevel() as HierarchyLevel from product;
--2.	—оздать процедуру, котора€ отобразит все подчиненные узлы с указанием уровн€ иерархии (параметр Ц значение узла).
create procedure showsubordinatenodes
@nodevalue hierarchyid
as
begin
with hierarchicalcte as
(
select id as product_id,name as product_name,description,price,seller_id,hierarchypath,hierarchypath.tostring() as hierarchy_path_str from product where hierarchypath.isdescendantof(@nodevalue) = 1
)
select product_id,product_name,description, price,seller_id,hierarchy_path_str,hierarchypath.getlevel() as hierarchy_level from hierarchicalcte
order by hierarchypath;
end;

exec showsubordinatenodes '/2/';
exec showsubordinatenodes '/';

drop procedure AddNode
--3.	—оздать процедуру, котора€ добавит подчиненный узел (параметр Ц значение родительского узла).
create procedure AddNode
@parentNode hierarchyid = null, 
@name nvarchar(100),           
@description nvarchar(max),     
@price decimal(10, 2),           
@seller_id int,                
@newId int output,              
@explicitPath nvarchar(100) = null
as
begin
declare @newNode hierarchyid;
if @explicitPath is not null
begin
set @newNode = hierarchyid::Parse(@explicitPath);
end
else
begin
if @parentNode is null
begin
set @newNode = hierarchyid::GetRoot().GetDescendant(null, null);
end
else
begin
set @newNode = @parentNode.GetDescendant(null, null);
end
end
declare @maxId int;
select @maxId = max(id) from product;
set @newId = isnull(@maxId, 0) + 1;
insert into product (id, name, description, price, seller_id, HierarchyPath)
values (@newId, @name, @description, @price, @seller_id, @newNode);
end;

declare @newId int;
exec AddNode
@name = 'new',     
@description = 'main', 
@price = 200.00,            
@seller_id = 1,            
@newId = @newId output,
@explicitPath = '/6/'; 
select @newId as NewNodeId;

declare @newId int;
exec AddNode
@name = 'fegtrhy',     
@description = 'sfdsdfsd', 
@price = 100.00,            
@seller_id = 1,            
@newId = @newId output;
select @newId as NewNodeId;

declare @parentNode hierarchyid;
set @parentNode = hierarchyid::Parse('/2/1/');  
declare @newId int;
exec AddNode
@parentNode = @parentNode,  
@name = 'new',     
@description = 'afsgrtrhyju', 
@price = 50.00,            
@seller_id = 2,            
@newId = @newId output;
select @newId as NewNodeId;


drop procedure MoveSubordinates
--4.	—оздать процедуру, котора€ переместит всех подчиненных (первый параметр Ц значение родительского узла, подчиненные которого будут 
--перемещатьс€, второй параметр Ц значение нового родительского узла).
create or alter procedure movesubordinates 
@oldparentnodehierarchy hierarchyid,
@newparentnodehierarchy hierarchyid
as
begin
declare @newchildnode hierarchyid;
declare @maxchildnode hierarchyid;
declare @currentchildnode hierarchyid;
declare @childnodescursor cursor;
declare @currentlevel int;
begin try
set @childnodescursor = cursor for
select hierarchypath from product 
where hierarchypath.GetAncestor(1) = @oldparentnodehierarchy
order by hierarchypath;
        
open @childnodescursor;
fetch next from @childnodescursor into @currentchildnode;
        
while @@fetch_status = 0
begin
select @maxchildnode = max(hierarchypath) from product 
where hierarchypath.GetAncestor(1) = @newparentnodehierarchy;
set @newchildnode = @newparentnodehierarchy.GetDescendant(@maxchildnode, null);
update product
set hierarchypath = @newchildnode
where hierarchypath = @currentchildnode;
exec movesubordinates @oldparentnodehierarchy = @currentchildnode, @newparentnodehierarchy = @newchildnode;
fetch next from @childnodescursor into @currentchildnode;
end;
close @childnodescursor;
deallocate @childnodescursor;
print '¬се узлы успешно перемещены.';
end try
begin catch
print 'ќшибка: невозможно переместить узлы.';
end catch
end;
go



declare @oldparentnodehierarchy hierarchyid = '/2/';
declare @newparentnodehierarchy hierarchyid = '/1/';
exec movesubordinates @oldparentnodehierarchy, @newparentnodehierarchy;
SELECT id, name, HierarchyPath.ToString() AS readable_hierarchy_path FROM product;
exec showsubordinatenodes '/';




