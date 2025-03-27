const { DataTypes } = require("sequelize");
const {sequelize} = require("./db");

const Book = sequelize.define("Book", {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    title: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { notEmpty: true }  
    },
    author: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { notEmpty: true }
    },
    genre: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { notEmpty: true } 
    },
    publication_year: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        defaultValue: new Date().getFullYear(),
        validate: { isInt: true, min: 1000, max: new Date().getFullYear() } 
    },
    available_copies: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        defaultValue: 1, 
        validate: { isInt: true, min: 0 } 
    },
    shelf_location: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        defaultValue: "Unknown"
    },
    available: { 
        type: DataTypes.BOOLEAN, 
        allowNull: false, 
        defaultValue: true 
    }
}, {
    timestamps: true // Adds createdAt and updatedAt columns
});

module.exports = Book;

