const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const path = require('path');
const { sequelize } = require("../models/db"); // ✅ Import Sequelize instance
const { QueryTypes } = require("sequelize");
const Transaction = require("../models/transaction");
const { Student, Librarian } = require("../models/user");


router.get("/search-results", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student/search-results.html"));
});

router.get("/borrowed-books.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student//borrowed-books.html"));
});

router.get("/api/search", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in" });
    }
    console.log("📢 API /api/search was called!");

    try {
        const searchQuery = req.query.q || ""; // that q= CSE comes to here because `/api/search?q=${encodeURIComponent(searchInput)}  now searchQuery = CSE
        console.log("🔍 Search Query Received:", searchQuery);

        if (!searchQuery.trim()) {
            return res.json({ success: false, error: "Search query is empty" });
        } //check points

        // ✅ Use Parameterized Query its real time quary  
        const query = `
            SELECT * FROM books
            WHERE title LIKE ? OR author LIKE ? OR genre LIKE ? OR shelf_location LIKE ?
        `;
        const replacements = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]; // ? = searchQuery = CSE

        console.log("🛠 Running SQL Query:", query);
        console.log("🛠 Query Replacements:", replacements);

        const books = await sequelize.query(query, { replacements, type: sequelize.QueryTypes.SELECT }); // colect the all details and stores in BOOKs

        console.log("📚 Books Found:", books);
        return res.json({ success: true, books }); //we need to see books in front side
    } catch (err) {
        console.error("❌ Database Error:", err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.post("/api/borrow", async (req, res) => {
    const { student_id, book_id } = req.body;

    console.log("Received Data: ", { student_id, book_id });  // Log the data

    // Check if student_id and book_id are present
    if (!student_id || !book_id) {
        return res.status(400).json({ success: false, error: "Student ID and Book ID are required" });
    }

    const issue_date = new Date(); // today you issued so today date
    const due_date = new Date(); 
    due_date.setDate(issue_date.getDate() + 30); // due date is next 30 days

    const transaction = await sequelize.transaction(); // transaction table values

    try {
        // Log SQL Query that checks student existence
        console.log(`Checking if student exists with student_id: ${student_id}`);  //your id shcome here
//?= students_id = 4 
        const studentExists = await sequelize.query(
            `SELECT id FROM students WHERE id = ?`,
            {
                replacements: [student_id],
                type: QueryTypes.SELECT,
                transaction
            }
        );

        if (studentExists.length === 0) {
            await transaction.rollback();
            console.log("Student does not exist");
            return res.status(400).json({ success: false, error: "Student does not exist" });
        }

        // Log SQL Query for book availability check
        console.log(`Checking book availability for book_id: ${book_id}`);
// same here books_id
        const bookCheck = await sequelize.query(
            `SELECT available_copies FROM books WHERE id = ? AND available_copies > 0`,
            {
                replacements: [book_id],
                type: QueryTypes.SELECT,
                transaction
            }
        );

        if (bookCheck.length === 0) {
            await transaction.rollback();
            console.log("Book not available");
            return res.status(400).json({ success: false, error: "Book not available" });
        }

        console.log("Inserting new transaction...");
//both are available ibook need to assign so i used to insert that details in one table so transaction is for the storing values 
        // Insert into transactions
        // createdAt, updatedAt) it shoes exact time stamps
        await sequelize.query(
            `INSERT INTO transactions (students_id, book_id, borrow_date, due_date, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            {
                replacements: [student_id, book_id, issue_date, due_date],
                type: QueryTypes.INSERT,
                transaction 
            }
        );

        // Update book availability
        const [_, affectedRows] = await sequelize.query(
            `UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0`,
            {
                replacements: [book_id],
                type: QueryTypes.UPDATE,
                transaction
            }
        );

        if (affectedRows === 0) {
            await transaction.rollback();
            console.log("Failed to update book availability");
            return res.status(400).json({ success: false, error: "Failed to update book availability" });
        }

        await transaction.commit();
        console.log("Book borrowed successfully");

        res.json({ success: true, message: "Book borrowed successfully" });

    } catch (err) {
        await transaction.rollback();
        console.error("Error borrowing book:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.get("/api/borrowed-books", async (req, res) => {
    const { student_id } = req.query; 

    console.log("Received Data: ", { student_id });

    if (!student_id) {
        return res.status(400).json({ success: false, error: "Student ID is required" });
    }

    try { 
        console.log("Received Data: ", { student_id });
        const query = `
            SELECT b.title, b.author, t.borrow_date, t.due_date, 
                   CASE 
                       WHEN t.return_date IS NULL AND NOW() > t.due_date 
                       THEN '₹' || (DATEDIFF(NOW(), t.due_date) * 5)  
                       ELSE '₹0'
                   END AS fine
            FROM transactions t
            JOIN books b ON t.book_id = b.id
            WHERE t.students_id = ? AND t.return_date IS NULL
        `;

        const books = await sequelize.query(query, { 
            replacements: [student_id], 
            type: sequelize.QueryTypes.SELECT 
        });

        res.json({ success: true, books });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.get("/api/pending-returns", async (req, res) => {
    try {
        console.log("📢 Fetching all pending returns...");

        const query = `
            SELECT 
                t.id AS transaction_id, 
                t.students_id, 
                s.hall_ticket AS student_hall_ticket, 
                s.first_name, 
                s.last_name, 
                s.department, 
                s.year, 
                s.semester, 
                b.id AS book_id, 
                b.title AS book_title, 
                b.author, 
                b.genre, 
                b.shelf_location, 
                t.borrow_date, 
                t.due_date, 
                CASE 
                    WHEN t.return_date IS NULL AND NOW() > t.due_date 
                    THEN (DATEDIFF(NOW(), t.due_date) * 5) 
                    ELSE 0 
                END AS fine_amount
            FROM 
                transactions t
            JOIN 
                students s ON t.students_id = s.id
            JOIN 
                books b ON t.book_id = b.id
            WHERE 
                t.return_date IS NULL;
        `;

        const transactions = await sequelize.query(query, {
            type: QueryTypes.SELECT,
        });

        console.log("📢 Transactions found:", transactions);

        res.json({
            success: true,
            transactions: transactions.length > 0 ? transactions : [],
            message: transactions.length === 0 ? "No pending returns!" : undefined,
        });

    } catch (error) {
        console.error("❌ Error fetching pending returns:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.post("/return-book", async (req, res) => {
    try {
        // 🔍 Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        const { id: userId, userType } = req.session.user;

        // 🔍 Allow both students & librarians to return books
        if (userType !== "student" && userType !== "librarian") {
            return res.status(403).json({ success: false, message: "Only students or librarians can return books" });
        }

        const { transaction_id, fine } = req.body;

        // 🔍 Validate transaction ID
        if (!transaction_id) {
            return res.status(400).json({ success: false, error: "Transaction ID is required" });
        }

        // ✅ Fetch transaction
        const transaction = await Transaction.findOne({
            where: { id: transaction_id, return_date: null }
        });

        // 🔍 Ensure transaction exists
        if (!transaction) {
            return res.status(404).json({ success: false, error: "Transaction not found or book already returned!" });
        }

        // 🔍 If a student is returning, ensure it's their book
        if (userType === "student" && transaction.students_id !== userId) {
            return res.status(403).json({ success: false, message: "Students can only return their own borrowed books" });
        }

        // ✅ Update transaction (mark book as returned)
        await transaction.update({ return_date: new Date(), fine_amount: fine });

        // ✅ Update book availability
        await Book.increment("available_copies", { where: { id: transaction.book_id } });

        return res.json({ success: true, message: "Book returned successfully!" });

    } catch (error) {
        console.error("❌ Error returning book:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.get("/api/profile", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in" });
    }

    const { id, userType } = req.session.user;

    try {
        let user = null;

        if (userType === "student") {
            user = await Student.findByPk(id, {
                attributes: ['first_name', 'last_name', 'hall_ticket', 'department', 'year', 'semester', 'email']
            });
        } else if (userType === "librarian") {
            user = await Librarian.findByPk(id, {
                attributes: ['first_name', 'last_name', 'employee_id', 'qualification', 'experience', 'email']
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid user type" });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("❌ Profile fetch error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
