const express = require("express");
const router = express.Router();
const Transaction = require("../models/transaction");
const Book = require("../models/book");

router.post("/borrowed-books.html", async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.session.user_id; 

        if (!user_id || !book_id) {
            return res.send(`<p>Error: User ID and Book ID are required</p><a href="/search-results">Go back</a>`);
        }

        const book = await Book.findByPk(book_id);
        if (!book || book.available_copies < 1) {
            return res.send(`<p>Error: Book not available</p><a href="/search-results">Go back</a>`);
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        await Transaction.create({
            user_id,
            book_id,
            borrow_date: new Date(),
            due_date: dueDate
        });

        await book.update({ available_copies: book.available_copies - 1 });

        res.redirect(`/search-results?query=${req.query.query}`); // Reload page with results
    } catch (error) {
        console.error("Error borrowing book:", error);
        res.send(`<p>Error: Internal server error</p><a href="/search-results">Go back</a>`);
    }
});

module.exports = router;
