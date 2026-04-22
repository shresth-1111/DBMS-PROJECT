const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// List categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT c.*, COUNT(b.book_id) as book_count 
            FROM categories c
            LEFT JOIN books b ON c.category_id = b.category_id
            GROUP BY c.category_id
        `);
        res.render('categories', { categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Category detail (books under category)
router.get('/:id', async (req, res) => {
    try {
        const [category] = await db.query('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
        if (category.length === 0) return res.status(404).send('Category not found');

        const [books] = await db.query('SELECT * FROM books WHERE category_id = ?', [req.params.id]);
        res.render('category_books', { category: category[0], books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
