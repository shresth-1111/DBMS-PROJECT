const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Home page
router.get('/', async (req, res) => {
    try {
        const [books] = await db.query('SELECT COUNT(*) as count FROM books');
        const [students] = await db.query('SELECT COUNT(*) as count FROM students');
        const [categories] = await db.query('SELECT COUNT(*) as count FROM categories');
        
        res.render('dashboard', {
            bookCount: books[0].count,
            studentCount: students[0].count,
            categoryCount: categories[0].count
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Login Page
router.get('/login', (req, res) => {
    if (req.session.adminId) return res.redirect('/');
    res.render('login', { error: null });
});

// Login Logic
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [admin] = await db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);
        if (admin.length > 0) {
            req.session.adminId = admin[0].admin_id;
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid credentials. Please try again.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/login');
    });
});

module.exports = router;
