import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

export const addBook = catchAsyncError(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ErrorHandler("Please fill all book details.", 400));
    }

    const { title, author, description, price, quantity } = req.body;

    if (!title || !author || !description || !price || !quantity) {
        return next(new ErrorHandler("Please fill all book details.", 400));
    }

    const book = await Book.create({
        title,
        author,
        description,
        price,
        quantity,
    });

    res.status(200).json({
        success: true,
        message: "Book added successfully",
        book,
    });
});


export const getAllBooks = catchAsyncError(async (req, res, next) => {
    const book = await Book.find();
    res.status(200).json({
        success: true,
        book,
    });
});

export const deleteBook = catchAsyncError(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        return next(new ErrorHandler("Book not found", 404));
    }

    await book.deleteOne();

    res.status(200).json({
        success: true,
        message: "Book deleted successfully",
    });
});
