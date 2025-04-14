import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({ accountVerified: true });
    res.status(200).json({
        success: true,
        users,
    });
});

export const registerNewAdmin = catchAsyncError(async (req, res, next) => {
    // Check if file is uploaded
    if (!req.files || !req.files.avatar) {
        return next(new ErrorHandler("Admin avatar is required.", 400));
    }

    const { name, email, password } = req.body || {};
    const avatar = req.files.avatar;

    // Validate fields
    if (!name || !email || !password) {
        return next(new ErrorHandler("Please fill all fields.", 400));
    }

    // Check if user already exists
    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
        return next(new ErrorHandler("User already registered.", 400));
    }

    // Password validation
    if (password.length < 8 || password.length > 16) {
        return next(
            new ErrorHandler(
                "Password must be between 8 to 16 characters long.",
                400
            )
        );
    }

    // File format validation
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(avatar.mimetype)) {
        return next(new ErrorHandler("File format not supported.", 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload avatar to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        { folder: "LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATAR" }
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(
            new ErrorHandler("Avatar upload failed. Please try again.", 500)
        );
    }

    // Create user
    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "Admin",
        accountVerified: true,
        avatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });

    res.status(201).json({
        success: true,
        message: "Admin registered successfully.",
        admin,
    });
});
