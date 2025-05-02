const sql = require('mssql');
const config = {
    user: 'masha',
    password: 'qq',
    server: '127.0.0.1',
    database: 'SMI',
    pool: {
        max: 10, 
        min: 0,  
        idleTimeoutMillis: 30000 
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

module.exports = class Product {
    constructor(name, price, category, stock) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.stock = stock;
    }

    async save() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('name', sql.NVarChar, this.name)
                .input('price', sql.Decimal, this.price)
                .input('category', sql.NVarChar, this.category)
                .input('stock', sql.Int, this.stock)
                .query('INSERT INTO Products (name, price, category, stock) OUTPUT INSERTED.id VALUES (@name, @price, @category, @stock)');
            
            this.id = result.recordset[0].id;
        } catch (err) {
            console.error('Error saving product:', err);
        }
    }

    static async getAllProducts() {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query('SELECT * FROM Products');
            return result.recordset;
        } catch (err) {
            console.error('Error fetching products:', err);
            return [];
        }
    }

    static async getProductById(id) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Products WHERE id = @id');
            return result.recordset[0];
        } catch (err) {
            console.error('Error fetching product by ID:', err);
            return null;
        }
    }

    static async updateProduct(id, updatedProduct) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, updatedProduct.name)
                .input('price', sql.Decimal, updatedProduct.price)
                .input('category', sql.NVarChar, updatedProduct.category)
                .input('stock', sql.Int, updatedProduct.stock)
                .query('UPDATE Products SET name = @name, price = @price, category = @category, stock = @stock WHERE id = @id');
            
            if (result.rowsAffected[0] > 0) {
                return { id, ...updatedProduct };
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error updating product:', err);
            return null;
        }
    }

    static async deleteProduct(id) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Products WHERE id = @id');
            
            if (result.rowsAffected[0] > 0) {
                return { id };
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            return null;
        }
    }
};
