class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        err = new ErrorHandler("Duplicate field value entered.", 400);
    }

    // Invalid JWT
    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("Json Web Token is invalid. Try again.", 400);
    }

    // Expired JWT
    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("Json Web Token has expired. Please login again.", 401);
    }

    // Mongoose CastError 
    if (err.name === "CastError") {
        err = new ErrorHandler(`Resource not found. Invalid: ${err.path}`, 400);
    }

    // Mongoose ValidationError
    const errorMessage = err.errors
        ? Object.values(err.errors)
            .map(error => error.message)
            .join(" ")
        : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};

export default ErrorHandler;
