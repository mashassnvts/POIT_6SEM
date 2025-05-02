const Product = require('../models/product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const product = await Product.getProductById(id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product' });
    }
};

exports.createProduct = async (req, res) => {
    const { name, price, category, stock } = req.body;
    const product = new Product(name, price, category, stock);
    try {
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const updatedProduct = req.body;
    try {
        const product = await Product.updateProduct(id, updatedProduct);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const product = await Product.deleteProduct(id);
        if (product) {
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};
