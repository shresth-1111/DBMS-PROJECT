const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session config
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// Provide session info to all views
app.use((req, res, next) => {
    res.locals.admin = req.session.adminId ? true : false;
    next();
});

// Import Routes
const indexRoutes = require('./routes/index');
const bookRoutes = require('./routes/books');
const studentRoutes = require('./routes/students');
const categoryRoutes = require('./routes/categories');
const issueRoutes = require('./routes/issues');

// Use Routes
app.use('/', indexRoutes);
app.use('/books', bookRoutes);
app.use('/students', studentRoutes);
app.use('/categories', categoryRoutes);
app.use('/issues', issueRoutes);

// Database check implicitly done when modules require db/connection
// Server initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
