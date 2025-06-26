DROP TABLE customer;
DROP TABLE administrator;
DROP TABLE seller;
DROP TABLE order_product;
DROP TABLE orders;
DROP TABLE product;

SELECT * FROM administrator;
SELECT * FROM customer
SELECT * FROM order_product
SELECT * FROM orders
SELECT * FROM product
SELECT * FROM seller

-- 1. Создание таблиц (Oracle версия)
CREATE TABLE customer (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name NVARCHAR2(100) NOT NULL,
    email NVARCHAR2(100) NOT NULL,
    password NVARCHAR2(100) NOT NULL,
    CONSTRAINT uk_customer_email UNIQUE (email)
);

CREATE TABLE administrator (
    id NUMBER PRIMARY KEY,
    name NVARCHAR2(100) NOT NULL,
    email NVARCHAR2(100) NOT NULL,
    password NVARCHAR2(100) NOT NULL,
    CONSTRAINT uk_admin_email UNIQUE (email)
);

CREATE TABLE seller (
    id NUMBER PRIMARY KEY,
    name NVARCHAR2(100) NOT NULL,
    email NVARCHAR2(100) NOT NULL,
    password NVARCHAR2(100) NOT NULL,
    CONSTRAINT uk_seller_email UNIQUE (email)
);

CREATE TABLE product (
    id NUMBER PRIMARY KEY,
    name NVARCHAR2(100) NOT NULL,
    description CLOB,
    price NUMBER(10, 2) NOT NULL,
    seller_id NUMBER NOT NULL,
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES seller(id)
);

CREATE TABLE orders (
    id NUMBER PRIMARY KEY,
    customer_id NUMBER NOT NULL,
    order_date TIMESTAMP DEFAULT SYSTIMESTAMP,
    status NVARCHAR2(50) NOT NULL,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE order_product (
    order_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    product_name NVARCHAR2(100) NOT NULL,
    quantity NUMBER DEFAULT 1,
    CONSTRAINT pk_order_product PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_order_product_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_product_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT chk_quantity CHECK (quantity > 0)
);

-- 2. Вставка тестовых данных (Oracle версия)
-- Администраторы
INSERT INTO administrator (id, name, email, password) VALUES (1, 'Admin Ivanov', 'admin1@example.com', 'password123');
INSERT INTO administrator (id, name, email, password) VALUES (2, 'Admin Petrov', 'admin2@example.com', 'password123');

-- Продавцы
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO seller (id, name, email, password) 
        VALUES (i, 'Seller ' || i, 'seller' || i || '@example.com', 'password123');
    END LOOP;
    COMMIT;
END;
/

-- Покупатели
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO customer (name, email, password) 
        VALUES ('Customer ' || i, 'customer' || i || '@example.com', 'password' || i);
    END LOOP;
    COMMIT;
END;
/

-- Товары
BEGIN
    FOR i IN 1..200 LOOP
        INSERT INTO product (id, name, description, price, seller_id) 
        VALUES (
            i, 
            'Product ' || i,
            'Description for product ' || i,
            ROUND(DBMS_RANDOM.VALUE(10, 1000), 2),
            MOD(i, 20) + 1
        );
    END LOOP;
    COMMIT;
END;
/

-- Заказы и товары в заказах
BEGIN
    FOR i IN 1..500 LOOP
        -- Вставка заказа
        INSERT INTO orders (id, customer_id, order_date, status)
        VALUES (
            i,
            MOD(i, 100) + 1,
            SYSTIMESTAMP - DBMS_RANDOM.VALUE(0, 730),
            CASE 
                WHEN DBMS_RANDOM.VALUE < 0.7 THEN 'Completed'
                WHEN DBMS_RANDOM.VALUE < 0.9 THEN 'Processing'
                ELSE 'Cancelled'
            END
        );

        -- Вставка товаров в заказ (1-5 уникальных товаров)
        DECLARE
            v_product_ids SYS.ODCINUMBERLIST := SYS.ODCINUMBERLIST();
            v_product_count INTEGER := TRUNC(DBMS_RANDOM.VALUE(1, 6));
        BEGIN
            -- Получаем уникальные товары
            SELECT id BULK COLLECT INTO v_product_ids
            FROM (SELECT id FROM product ORDER BY DBMS_RANDOM.VALUE)
            WHERE ROWNUM <= v_product_count;

            FOR j IN 1..v_product_ids.COUNT LOOP
                INSERT INTO order_product (order_id, product_id, product_name, quantity)
                VALUES (i, v_product_ids(j), (SELECT name FROM product WHERE id = v_product_ids(j)), TRUNC(DBMS_RANDOM.VALUE(1, 6)));
            END LOOP;
        END;
    END LOOP;
    COMMIT;
END;

DROP TABLE REPORT



CREATE TABLE report (
    id NUMBER PRIMARY KEY,
    xmldata XMLTYPE  
);
SELECT * FROM REPORT

CREATE OR REPLACE PROCEDURE GenerateXML AS
    xmldata XMLTYPE;
BEGIN
    SELECT 
        XMLELEMENT("data",
            (
                SELECT XMLAGG(
                    XMLELEMENT("product", 
                        XMLFOREST(p.id AS "product_id", p.name AS "product_name", p.price AS "price")
                    ) ORDER BY p.id
                ) FROM product p
            ),
            (
                SELECT XMLAGG(
                    XMLELEMENT("order", 
                        XMLFOREST(o.id AS "order_id", o.order_date AS "order_date", o.status AS "status"),
                        XMLELEMENT("products",
                            (
                                SELECT XMLAGG(
                                    XMLELEMENT("product_name", op.product_name)
                                )
                                FROM order_product op
                                WHERE op.order_id = o.id
                            )
                        ),
                        XMLELEMENT("total_cost",
                            (
                                SELECT SUM(op.quantity * p.price) 
                                FROM order_product op 
                                JOIN product p ON op.product_id = p.id 
                                WHERE op.order_id = o.id
                            )
                        )
                    )
                ) FROM orders o
            ),
            (
                SELECT XMLAGG(
                    XMLELEMENT("customer", 
                        XMLFOREST(c.id AS "customer_id", c.name AS "name")
                    )
                ) FROM customer c
            ),
            XMLELEMENT("generated_at", SYSTIMESTAMP)
        ) INTO xmldata FROM dual;

    INSERT INTO report (id, xmldata) VALUES ((SELECT NVL(MAX(id), 0) + 1 FROM report), xmldata);
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('XML generated and inserted into Report table.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END GenerateXML;
/

BEGIN
    GenerateXML;
END;
/
SELECT * FROM report;

CREATE OR REPLACE PROCEDURE InsertXMLToReport(p_xmldata XMLTYPE) AS
BEGIN
    INSERT INTO report (id, xmldata) 
    VALUES ((SELECT NVL(MAX(id), 0) + 1 FROM report), p_xmldata);
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('XML inserted into Report table successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error inserting XML: ' || SQLERRM);
END InsertXMLToReport;
/

DECLARE
    v_xmldata XMLTYPE;
BEGIN
    GenerateXML;
    SELECT xmldata INTO v_xmldata FROM report WHERE ROWNUM = 1; 
    InsertXMLToReport(v_xmldata);
END;
/

CREATE INDEX idx_report_xml ON report(xmldata)
INDEXTYPE IS XDB.XMLIndex;

SELECT * FROM USER_INDEXES WHERE INDEX_NAME = 'IDX_REPORT_XML';
SELECT EXTRACTVALUE(xmldata, '/data/product[2]/price') AS product_name FROM report;

CREATE OR REPLACE PROCEDURE ExtractValuesFromXML(p_element_path VARCHAR2) AS
    v_value VARCHAR2(4000);
BEGIN
    SELECT EXTRACTVALUE(xmldata, p_element_path)
    INTO v_value
    FROM report
    WHERE ROWNUM = 1; 

    DBMS_OUTPUT.PUT_LINE('Extracted Value: ' || v_value);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No data found for the specified element.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END ExtractValuesFromXML;
/

BEGIN
    ExtractValuesFromXML('/data/product[1]/product_name'); 
END;
/
BEGIN
    ExtractValuesFromXML('/data/product[2]/price'); 
END;
/
