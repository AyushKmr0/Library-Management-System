import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";
import { calculateFine } from "../utils/fineCalculator.js";

export const recordBorrowedBook = catchAsyncError(async (req, res, next) => {
    const { id: bookId } = req.params;
    const { email } = req.body || {};

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    // Check if user exists
    const user = await User.findOne({ email, accountVerified: true });
    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    // Check book availability
    if (book.quantity === 0) {
        return next(new ErrorHandler("Book not available.", 400));
    }

    // Check if user already borrowed the book and hasn't returned it
    const alreadyBorrowed = user.borrowedBooks.find(
        (borrowed) =>
            borrowed.bookId.toString() === bookId && !borrowed.returned
    );

    if (alreadyBorrowed) {
        return next(
            new ErrorHandler("You have already borrowed this book.", 400)
        );
    }

    // Update book quantity and availability
    book.quantity -= 1;
    book.availability = book.quantity > 0;
    await book.save();

    // Set borrowed and due dates
    const borrowedDate = new Date();
    const dueDate = new Date(borrowedDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update user borrowed books
    user.borrowedBooks.push({
        bookId: book._id,
        bookTitle: book.title,
        borrowedDate,
        dueDate,
    });
    await user.save();

    // Create borrow record
    await Borrow.create({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        book: book._id,
        dueDate,
        price: book.price,
    });
    // Respond
    res.status(200).json({
        success: true,
        message: "Book borrowed successfully.",
    });
});

export const returnBorrowedBook = catchAsyncError(async (req, res, next) => {
    const { bookId } = req.params;
    const { email } = req.body || {};

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    // Check if user exists
    const user = await User.findOne({ email, accountVerified: true });
    if (!user) {
        return next(new ErrorHandler("User not found or not verified.", 404));
    }

    // Check if user has borrowed this book
    const borrowedBook = user.borrowedBooks.find(
        (borrowed) =>
            borrowed.bookId.toString() === bookId && !borrowed.returned
    );

    if (!borrowedBook) {
        return next(
            new ErrorHandler(
                "This book was not borrowed or already returned.",
                400
            )
        );
    }

    // Mark as returned in user's record
    borrowedBook.returned = true;
    await user.save();

    // Update book availability
    book.quantity += 1;
    book.availability = book.quantity > 0;
    await book.save();

    // Find matching borrow record
    const borrow = await Borrow.findOne({
        book: bookId,
        "user.email": email,
        returnedDate: null,
    });

    if (!borrow) {
        return next(
            new ErrorHandler(
                "Borrow record not found or already returned.",
                400
            )
        );
    }

    // Set return date and fine
    borrow.returnedDate = new Date();
    const fine = calculateFine(borrow.dueDate);
    borrow.fine = fine;
    await borrow.save();

    const totalCharge = fine + book.price;

    res.status(200).json({
        success: true,
        message:
            `The book has been returned successfully. Total charges: ₹${book.price}` +
            (fine > 0
                ? ` with a fine of ₹${fine}. Total amount: ₹${totalCharge}`
                : `.`),
    });
});

export const borrowedBooks = catchAsyncError(async (req, res, next) => {
    const { borrowedBooks } = req.user;
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});

export const getBorrowedBooksForAdmin = catchAsyncError(
    async (req, res, next) => {
        const borrowedBook = await Borrow.find();
        res.status(200).json({
            success: true,
            borrowedBook,
        });
    }
);
