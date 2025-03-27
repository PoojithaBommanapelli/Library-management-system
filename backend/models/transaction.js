const { Model, DataTypes } = require('sequelize');
const { sequelize} = require('./db'); // ✅ Import database connection
const { Student, Librarian } = require('./user'); // ✅ Import User model
const Book = require('./book'); // ✅ Import Book model

class Transaction extends Model {}

Transaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        students_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students', // ✅ Ensure table name matches `User` model transcation table interlinked with student and book
                key: 'id',
            },
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'books', // ✅ Ensure table name matches `Book` model
                key: 'id',
            },
        },
        borrow_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        return_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        fine_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
    },
    {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        timestamps: true,
    }
);

// ✅ Check if `User` and `Book` models are valid before defining associations
if (Student.prototype instanceof Model) {
    Transaction.belongsTo(Student, { foreignKey: 'student_id', as: 'student'  });
} else {
    console.error('Student model is not a valid Sequelize model');
}

if (Book.prototype instanceof Model) {
    Transaction.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
} else {
    console.error('Book model is not a valid Sequelize model');
}

module.exports = Transaction
