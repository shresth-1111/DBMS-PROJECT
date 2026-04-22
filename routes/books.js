const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { isAdmin } = require('../middleware/auth');

// List books
router.get('/', async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.*, c.category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.category_id
            ORDER BY b.book_id DESC
        `);
        res.render('books', { books });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add book form (Admin only)
router.get('/new', isAdmin, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.render('book_form', { categories, book: null });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Insert book
router.post('/', isAdmin, async (req, res) => {
    const { book_name, author, category_id, shelf_number, total_copies } = req.body;
    try {
        await db.query(`
            INSERT INTO books (book_name, author, category_id, shelf_number, total_copies, available_copies) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [book_name, author, category_id, shelf_number, total_copies, total_copies]);
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Book detail
router.get('/:id', async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT b.*, c.category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.category_id
            WHERE b.book_id = ?
        `, [req.params.id]);

        if (books.length === 0) return res.status(404).send('Book not found');

        const [issues] = await db.query(`
            SELECT i.*, s.name as student_name 
            FROM issue_logs i
            LEFT JOIN students s ON i.student_id = s.student_id
            WHERE i.book_id = ?
        `, [req.params.id]);

        res.render('book_detail', { book: books[0], issues });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Edit book form
router.get('/:id/edit', isAdmin, async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books WHERE book_id = ?', [req.params.id]);
        if (books.length === 0) return res.status(404).send('Book not found');

        const [categories] = await db.query('SELECT * FROM categories');
        res.render('book_form', { book: books[0], categories });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update book
router.post('/:id/edit', isAdmin, async (req, res) => {
    const { book_name, author, category_id, shelf_number, total_copies } = req.body;
    try {
        const [oldBook] = await db.query('SELECT total_copies, available_copies FROM books WHERE book_id = ?', [req.params.id]);

        const diff = total_copies - oldBook[0].total_copies;
        const newAvailable = oldBook[0].available_copies + diff;

        await db.query(`
            UPDATE books 
            SET book_name=?, author=?, category_id=?, shelf_number=?, total_copies=?, available_copies=?
            WHERE book_id=?
        `, [book_name, author, category_id, shelf_number, total_copies, newAvailable, req.params.id]);

        res.redirect(`/books/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete book
router.post('/:id/delete', isAdmin, async (req, res) => {
    try {
        // Will fail if there are issue logs due to FK, simplistic handling:
        await db.query('DELETE FROM books WHERE book_id = ?', [req.params.id]);
        res.redirect('/books');
    } catch (err) {
        res.status(400).send('Cannot delete book that has issue logs.');
    }
});

module.exports = router;