// backend/app.js - Main Server File
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {sequelize} = require("./backend/models/db");
const path = require('path'); // folder direction
const session = require('express-session'); // it telss the how and what are elemts their in open page
const borrowedBooksRoutes = require("./backend/routes/borrowedBooks");


// Load environment variables
dotenv.config();

const authRoutes = require("./backend/routes/auth");
const studentRoutes = require("./backend/routes/student");
const librarianRoutes = require("./backend/routes/librarian");

const app = express();

const borrowRoutes = require("./backend/routes/borrowedBooks.js");


app.use("/", borrowRoutes);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views'))); // Serves static files (HTML, CSS)
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-key",// Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set `true` if using HTTPS
}));
app.use("/api", borrowedBooksRoutes);
app.use("/", studentRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth', 'index.html'));
});

app.get('/student-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth', 'student-login.html'));
});

app.get('/librarian-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth', 'librarian-login.html'));
});

app.get('/librarian-register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth', 'librarian-register.html'));
});
app.get("/manage-books.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../../views/librarian/manage-books.html"));
});

app.get('/student-register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth', 'student-register.html'));
});
app.get('/search-results', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'student', 'search-results.html'));
});


// Sync Database
sequelize.sync()
  .then(() => console.log("Database connected & synced"))
  .catch((err) => console.error("DB Sync Error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/student", studentRoutes);
app.use("/librarian", librarianRoutes);
app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:5000'`));


