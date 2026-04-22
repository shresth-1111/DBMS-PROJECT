const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { isAdmin } = require('../middleware/auth');

// List students
router.get('/', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students ORDER BY student_id DESC');
        res.render('students', { students });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add student form
router.get('/new', isAdmin, (req, res) => {
    res.render('student_form', { student: null });
});

// Insert student
router.post('/', isAdmin, async (req, res) => {
    try {
        const { name, age } = req.body;
        await db.query('INSERT INTO students (name, age) VALUES (?, ?)', [name, age]);
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Student detail
router.get('/:id', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students WHERE student_id = ?', [req.params.id]);
        if (students.length === 0) return res.status(404).send('Student not found');
        
        const [issues] = await db.query(`
            SELECT i.*, b.book_name 
            FROM issue_logs i
            JOIN books b ON i.book_id = b.book_id
            WHERE i.student_id = ?
        `, [req.params.id]);

        res.render('student_detail', { student: students[0], issues });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Edit form
router.get('/:id/edit', isAdmin, async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students WHERE student_id = ?', [req.params.id]);
        if (students.length === 0) return res.status(404).send('Student not found');
        res.render('student_form', { student: students[0] });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update student
router.post('/:id/edit', isAdmin, async (req, res) => {
    try {
        const { name, age } = req.body;
        await db.query('UPDATE students SET name=?, age=? WHERE student_id=?', [name, age, req.params.id]);
        res.redirect(`/students/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete student
router.post('/:id/delete', isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE student_id=?', [req.params.id]);
        res.redirect('/students');
    } catch (err) {
        res.status(400).send('Cannot delete student with active issue logs.');
    }
});

module.exports = router;
