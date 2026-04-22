const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { isAdmin } = require('../middleware/auth');

// List issue logs
router.get('/', isAdmin, async (req, res) => {
    try {
        const [issues] = await db.query(`
            SELECT i.issue_id, i.issue_date, b.book_id, b.book_name, s.student_id, s.name as student_name
            FROM issue_logs i
            JOIN books b ON i.book_id = b.book_id
            JOIN students s ON i.student_id = s.student_id
            ORDER BY i.issue_date DESC
        `);
        res.render('issues', { issues });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
