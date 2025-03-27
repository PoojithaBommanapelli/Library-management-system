// Custom error class for operational errors
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;  // Default to 500 if not provided
        this.isOperational = true;  // Helps identify expected errors
        Error.captureStackTrace(this, this.constructor); // Captures the stack trace
    }
}

// Middleware to handle errors in the Express application
const errorHandler = (err, req, res, next) => {
    console.error(err);  // Log the error for debugging purposes

    // If the error is an operational error, respond with the message and status
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // If it's an unexpected error, send a generic 500 server error
    return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred. Please try again later.'
    });
};

// Exporting both error handler and CustomError class
module.exports = {
    errorHandler,
    CustomError
};
