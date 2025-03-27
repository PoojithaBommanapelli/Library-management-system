const express = require("express");
const bcrypt = require("bcryptjs"); 
const { Student, Librarian } = require("../models/user");
const router = express.Router();
const path = require("path");
const { Op } = require("sequelize");

// ✅ Function to set user session
const setSession = (req, user, userType) => {
    req.session.user = {
        id: user.id,
        email: user.email,
        hall_ticket: user.hall_ticket || null, // Hall Ticket for students
        userType
    };
};

router.post('/librarian-register', async (req, res) => {
    try {
        const { first_name, last_name, employee_id, qualification, experience, email, password, confirm_password } = req.body;

        if (!first_name || !last_name || !employee_id || !qualification || !experience || !email || !password || !confirm_password) {
            return res.status(400).send('All fields are required!');
        }
        if (password !== confirm_password) {
            return res.status(400).send('Passwords do not match!');
        }
           // ✅ Check if employee_id OR email already exists
           const existingLibrarian = await Librarian.findOne({
            where: { [Op.or]: [{ employee_id }, { email }] }
        });
        if (existingLibrarian) {
            return res.status(400).json({
                success: false,
                message: `Librarian with ${existingLibrarian.employee_id === employee_id ? `Employee ID: ${employee_id}` : `Email: ${email}`} already exists!`
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Use correct model reference
        const librarian = await Librarian.create({
            first_name,
            last_name,
            employee_id,
            qualification,
            experience: parseInt(experience, 10),
            email,
            password: hashedPassword
        });
        res.sendFile(path.join(__dirname, "../../views/auth/index.html"));

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send("Error registering librarian");
    }
});

router.post('/student-register', async (req, res) => {
    try {
        const { first_name, last_name, hall_ticket, department, year, semester, email, password, confirm_password } = req.body;

        if (!first_name || !last_name || !hall_ticket || !department || !year || !semester || !email || !password || !confirm_password) {
            return res.status(400).send('All fields are required!');
        }

        if (password !== confirm_password) {
            return res.status(400).send('Passwords do not match!'); 
        }



        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Use Sequelize instead of raw query
        const student = await Student.create({
            first_name,
            last_name,
            hall_ticket,
            department,
            year: parseInt(year, 10),
            semester: parseInt(semester, 10),
            email,
            password: hashedPassword
        });

        
        res.sendFile(path.join(__dirname, "../../views/auth/index.html"));

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).send("Error registering student");
    }
});

// ✅ Student Login Route
router.post("/student-login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await Student.findOne({ where: { email } });

        if (!student) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        req.session.user = {
            id: student.id,         // Store student ID in session
            email: student.email,   // Store email
            hall_ticket: student.hall_ticket,
            userType: "student"     // You can also store role if needed
        };

        // Optionally, send back a success message and student info to the frontend
        return res.json({
            success: true,
            message: "Login successful",
            studentId: student.id,    // You can return the student ID here
            hall_ticket: student.hall_ticket,
        });

    } catch (error) {
        console.error("❌ Student Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// ✅ Librarian Login Route
router.post("/librarian-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const librarian = await Librarian.findOne({ where: { email } });
        if (!librarian) {
            return res.status(404).json({ success: false, message: "Librarian not found!" });
        }

        const match = await bcrypt.compare(password, librarian.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Incorrect password!" });
        }

        // ✅ Store only in `req.session.user` (REMOVE `req.session.userId`)
        req.session.user = {
            id: librarian.id,
            email: librarian.email,
            userType: "librarian"
        };

        return res.redirect("/librarian/profile.html" );

    } catch (error) {
        console.error("❌ Librarian Login Error:", error);
        res.status(500).json({ success: false, message: "Error during librarian login" });
    }
});


// ✅ Logout Route
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ success: true, message: "Logged out successfully!" });
    });
});

// ✅ Dashboard Route Based on User Type
router.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Unauthorized access!" });
    }

    const { userType } = req.session.user;
    if (userType === "student") {
        res.sendFile(path.join(__dirname, "../../views/student/student-dashboard.html"));
    } else if (userType === "librarian") {
        res.sendFile(path.join(__dirname, "../../views/librarian/dashboard.html"));
    } else {
        res.status(400).json({ success: false, message: "Invalid user type!" });
    }
});

// ✅ Move GET Routes Outside the POST Handlers
router.get("/student-profile.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student/student-profile.html"));
});

router.get("/student-dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student/student-dashboard.html"));
});

router.get("/borrowed-books.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student/borrowed-books.html"));
});

router.get("/search-results.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/student/search-results.html"));
});

router.get("/librarian/profile.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/librarian/profile.html"));
});

router.get("/librarian/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/librarian/dashboard.html"));
});

router.get("/librarian/returns.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/librarian/returns.html"));
});

router.get("/librarian/add-book.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/librarian/add-book.html"));
});

module.exports = router;
