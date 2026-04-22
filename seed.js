const db = require('./db/connection');

async function seed() {
    try {
        console.log('Seeding database...');

        // Ensure Database
        // (Assuming database is already created and used in pool)

        await db.query(`DROP TABLE IF EXISTS issue_logs`);
        await db.query(`DROP TABLE IF EXISTS books`);
        await db.query(`DROP TABLE IF EXISTS students`);
        await db.query(`DROP TABLE IF EXISTS categories`);
        await db.query(`DROP TABLE IF EXISTS admin`);

        // Create Tables
        await db.query(`
            CREATE TABLE categories (
                category_id INT PRIMARY KEY AUTO_INCREMENT,
                category_name VARCHAR(255) NOT NULL
            )
        `);
        console.log('Created categories table.');

        await db.query(`
            CREATE TABLE books (
                book_id INT PRIMARY KEY AUTO_INCREMENT,
                book_name VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                category_id INT,
                shelf_number VARCHAR(50),
                total_copies INT NOT NULL,
                available_copies INT NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            )
        `);
        console.log('Created books table.');

        await db.query(`
            CREATE TABLE students (
                student_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                age INT
            )
        `);
        console.log('Created students table.');

        await db.query(`
            CREATE TABLE issue_logs (
                issue_id INT PRIMARY KEY AUTO_INCREMENT,
                book_id INT,
                student_id INT,
                issue_date DATE,
                FOREIGN KEY (book_id) REFERENCES books(book_id),
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            )
        `);
        console.log('Created issue_logs table.');

        await db.query(`
            CREATE TABLE admin (
                admin_id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);
        console.log('Created admin table.');

        // Insert Admin
        await db.query(`INSERT INTO admin (username, password) VALUES ('admin', 'admin123')`);

        // Insert Categories (15)
        const categories = [
            'Fiction', 'Science', 'Programming', 'History', 'Mathematics',
            'Philosophy', 'Art', 'Literature', 'Technology', 'Business',
            'Economy', 'Psychology', 'Biography', 'Fantasy', 'Health'
        ];
        for (let cat of categories) {
            await db.query(`INSERT INTO categories (category_name) VALUES (?)`, [cat]);
        }

        // Insert Students (30)
        let studentIds = [];
        for (let i = 1; i <= 30; i++) {
            const age = Math.floor(Math.random() * 5) + 18; // 18 to 22
            const [res] = await db.query(`INSERT INTO students (name, age) VALUES (?, ?)`, [`Student ${i}`, age]);
            studentIds.push(res.insertId);
        }

        // Insert Books (80)
        let bookIds = [];
        for (let i = 1; i <= 80; i++) {
            const catId = Math.floor(Math.random() * 15) + 1; // 1 to 15
            const total = Math.floor(Math.random() * 10) + 5; // 5 to 14
            const [res] = await db.query(
                `INSERT INTO books (book_name, author, category_id, shelf_number, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)`,
                [`Book ${i}`, `Author ${i}`, catId, `Shelf-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`, total, total]
            );
            bookIds.push({ id: res.insertId, total: total, available: total });
        }

        // Insert Issues (50)
        for (let i = 0; i < 50; i++) {
            // Select random student
            const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
            // Select random book with available copies
            const availableBooks = bookIds.filter(b => b.available > 0);
            if (availableBooks.length === 0) break;

            const bookIndex = Math.floor(Math.random() * availableBooks.length);
            const book = availableBooks[bookIndex];

            // Log issue
            await db.query(`INSERT INTO issue_logs (book_id, student_id, issue_date) VALUES (?, ?, CURDATE() - INTERVAL ? DAY)`, [book.id, studentId, Math.floor(Math.random() * 30)]);

            // Update available count in array
            book.available -= 1;
        }

        // Apply available counts to DB
        for (let book of bookIds) {
            if (book.available !== book.total) {
                await db.query(`UPDATE books SET available_copies = ? WHERE book_id = ?`, [book.available, book.id]);
            }
        }

        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
