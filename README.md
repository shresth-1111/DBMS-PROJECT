## 🚀 How to Run the Project

Clone the repository from GitHub:
```bash
git clone https://github.com/your-username/library-management-system.git
cd library-management-system
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the root directory and add your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword{Tanish's sql pswd}
DB_NAME=library_db

PORT=3000
SESSION_SECRET=your_secret_key{Use mine}
```

Set up the database in MySQL:
```sql
CREATE DATABASE library_db;
```

(Start MySQL server before this step)

Run the application:
```bash
npm start
```
or
```bash
node app.js
```

Open your browser and visit:
```
http://localhost:3000
```

---
