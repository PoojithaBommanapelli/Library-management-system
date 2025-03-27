const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Transaction = require("../models/transaction"); 
const { Op } = require("sequelize");
const path = require("path");

router.get("/search-results", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student/search-results.html"));
});



// ✅ Route to add a new book
router.post("/add-book", async (req, res) => {
    try {
        const { title, author, genre, publication_year, available_copies, shelf_location } = req.body;

        // ✅ Validate required fields
        if (!title || !author || !genre || !publication_year || !shelf_location) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        // ✅ Insert book using Sequelize
        const newBook = await Book.create({
            title,
            author,
            genre,
            publication_year,
            available_copies: available_copies || 1, // Default to 1 if not provided
            shelf_location
        });

        return res.status(201).json({ message: "Book added successfully!", book: newBook });

    } catch (error) {
        console.error("Error adding book:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Route to fetch all books (Paginated)
router.get("/books", async (req, res) => {
    try {
        const { page = 1, limit = 100, search } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = {};

        // ✅ Add search filter (if provided)
        if (search) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { author: { [Op.like]: `%${search}%` } },
                    { genre: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const books = await Book.findAll({ where: whereClause, limit: parseInt(limit), offset });

        return res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Route to return a book
router.get("/api/pending-returns", async (req, res) => {
    try {
        const transactions = await db.query(`
            SELECT t.id, t.user_id, t.book_id, b.title, t.borrow_date, t.due_date
            FROM transactions t
            JOIN books b ON t.book_id = b.id
            WHERE t.return_date IS NULL
        `, {
            type: QueryTypes.SELECT
        });

        res.json({ success: true, transactions });
    } catch (error) {
        console.error("Error fetching pending returns:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// ✅ Route to update a book
router.put("/update-book/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
        const updatedBook = await Book.update(req.body, { where: { id: bookId } });

        if (updatedBook[0] > 0) {
            return res.json({ message: "Book updated successfully!" });
        } else {
            return res.status(404).json({ error: "Book not found!" });
        }
    } catch (error) {
        console.error("Error updating book:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Route to delete a book
router.delete("/delete-book/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
        const deleted = await Book.destroy({ where: { id: bookId } });

        if (deleted) {
            return res.json({ message: "Book deleted successfully!" });
        } else {
            return res.status(404).json({ error: "Book not found!" });
        }
    } catch (error) {
        console.error("Error deleting book:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/return-book", async (req, res) => {
    try {
        const { transaction_id } = req.body;
        console.log("📢 Received return request for transaction:", transaction_id); // ✅ Debugging

        if (!transaction_id) {
            return res.status(400).json({ success: false, error: "Transaction ID is required" });
        }

        // ✅ Check if transaction exists
        const transaction = await Transaction.findOne({
            where: { id: transaction_id, return_date: null }
        });

        console.log("🔍 Transaction found:", transaction); // ✅ Debugging

        if (!transaction) {
            return res.status(404).json({ success: false, error: "Transaction not found or book already returned!" });
        }

        // ✅ Update transaction with return date
        await transaction.update({ return_date: new Date() });
        console.log("✅ Transaction updated with return date");

        // ✅ Update book availability
        await Book.increment("available_copies", { where: { id: transaction.book_id } });
        console.log("✅ Book availability updated");

        return res.json({ success: true, message: "Book returned successfully!" });

    } catch (error) {
        console.error("❌ Error returning book:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
