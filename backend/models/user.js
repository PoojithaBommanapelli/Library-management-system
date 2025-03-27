const { DataTypes } = require("sequelize");
const { sequelize } = require("../models/db");

// ✅ Student Model
const Student = sequelize.define("Students", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  hall_ticket: { type: DataTypes.STRING, allowNull: false, unique: true },
  department: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  semester: { type: DataTypes.INTEGER, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true , tableName: 'students' },// Explicitly set table name to 'librarians'
); // ✅ No need to manually define timestamps

// ✅ Librarian Model
const Librarian = sequelize.define("Librarian", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // ✅ Added ID for consistency
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  employee_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  qualification: { type: DataTypes.STRING, allowNull: false },
  experience: { type: DataTypes.INTEGER, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true, tableName: 'librarians'}, // Explicitly set table name to 'librarians'
) ;

// ✅ Sync models (Use Migrations in Production)
sequelize.sync({ alter: true }) // ⚠️ Avoid `alter: true` in production; use migrations instead!
  .then(() => console.log("📌 Tables synced successfully"))
  .catch(err => console.error("❌ Error syncing tables:", err));

module.exports = { Student, Librarian };
