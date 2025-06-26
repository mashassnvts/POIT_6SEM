OPTIONS (SKIP=1, ERRORS=50, DIRECT=TRUE)
LOAD DATA
INFILE 'orders_data.txt'
BADFILE 'orders_bad.bad'
DISCARDFILE 'orders_discard.dsc'
APPEND
INTO TABLE orders
FIELDS TERMINATED BY '|' TRAILING NULLCOLS
(
    id,
    customer_id,
    order_date TIMESTAMP "YYYY-MM-DD HH24:MI:SS",
    status "UPPER(:status)"  
)