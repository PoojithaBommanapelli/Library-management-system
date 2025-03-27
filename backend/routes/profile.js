const express = require("express");
const router = express.Router();
const { Student, Librarian } = require("../models/user");

// Profile API
router.get("/api/profile", async (req, res) => {
    console.log("📢 Session Data:", req.session);  // Debugging

    // ✅ Ensure session exists and user is logged in
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "User not logged in" });
    }

    const { id, userType } = req.session.user;

    try {
        let user = null;

        // ✅ Fetch user based on session type
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

        // ✅ Check if user was found
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
