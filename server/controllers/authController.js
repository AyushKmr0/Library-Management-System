import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";

export const register = catchAsyncError(async (req, res, next) => {
    try {
        if (!req.body) {
            return next(new ErrorHandler("Please enter all fields.", 400));
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return next(new ErrorHandler("Please enter all fields.", 400));
        }

        const isRegistered = await User.findOne({
            email,
            accountVerified: true,
        });

        if (isRegistered) {
            return next(new ErrorHandler("User already exists.", 400));
        }

        const registerationAttemptsByUser = await User.find({
            email,
            accountVerified: false,
        });

        if (registerationAttemptsByUser.length >= 5) {
            return next(
                new ErrorHandler(
                    "You have exceeded the number of registration attempts, Please contact support.",
                    400
                )
            );
        }

        if (password.length < 8 || password.length > 16) {
            return next(
                new ErrorHandler(
                    "Password must be between 8 and 16 characters.",
                    400
                )
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const verificationCode = await user.generateVerificationCode();

        await user.save();
        sendVerificationCode(verificationCode, email, res);
    } catch (error) {
        next(error);
    }
});

export const verifyOTP = catchAsyncError(async (req, res, next) => {
    if (!req.body) {
        return next(new ErrorHandler("Email or OTP is missing.", 400));
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorHandler("Email or OTP is missing.", 400));
    }

    try {
        const userAllEntries = await User.find({
            email,
            accountVerified: false,
        }).sort({
            createdAt: -1,
        });

        if (!userAllEntries || userAllEntries.length === 0) {
            return next(
                new ErrorHandler("User not found or already verified.", 404)
            );
        }

        let user = userAllEntries[0];

        // Delete older unverified duplicates
        if (userAllEntries.length > 1) {
            await User.deleteMany({
                _id: {
                    $ne: user._id,
                },
                email,
                accountVerified: false,
            });
        }

        // Check if OTP was already used or expired in DB
        if (!user.verificationCode || !user.verificationCodeExpire) {
            return next(new ErrorHandler("OTP already used or expired.", 400));
        }

        if (user.verificationCode !== Number(otp)) {
            return next(new ErrorHandler("Invalid OTP.", 400));
        }

        const currentTime = Date.now();
        const expireTime = new Date(user.verificationCodeExpire).getTime();

        if (currentTime > expireTime) {
            return next(new ErrorHandler("OTP expired.", 400));
        }

        user.accountVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpire = null;

        await user.save({
            validateModifiedOnly: true,
        });

        sendToken(user, 200, "Account Verified.", res);
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return next(new ErrorHandler("Internal server error.", 500));
    }
});

export const login = catchAsyncError(async (req, res, next) => {
    if (!req.body) {
        return next(new ErrorHandler("Please enter all fields.", 400));
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter all fields.", 400));
    }

    const user = await User.findOne({
        email,
        accountVerified: true,
    }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 400));
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password.", 400));
    }

    sendToken(user, 200, "User login successfully.", res);
});

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        .json({
            success: true,
            message: "Logged out successfully.",
        });
});

export const getUser = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    console.log("REQ BODY: ", req.body);
    if (!req.body || !req.body.email) {
        return next(new ErrorHandler("Email is required.", 400));
    }

    const user = await User.findOne({
        email: req.body.email,
        accountVerified: true,
    });

    if (!user) {
        return next(new ErrorHandler("Invalid email.", 400));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
        validateBeforeSave: false,
    });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "Bookworm Library Management System Password Recovery",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler(
                "Reset password token is invalid or has been expired.",
                400
            )
        );
    }

    const { password, confirmPassword } = req.body || {};

    if (!password || !confirmPassword) {
        return next(
            new ErrorHandler("Both password fields are required.", 400)
        );
    }

    if (password !== confirmPassword) {
        return next(
            new ErrorHandler("Password & confirm password do not match.", 400)
        );
    }

    if (password.length < 8 || password.length > 16) {
        return next(
            new ErrorHandler(
                "Password must be between 8 and 16 characters.",
                400
            )
        );
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, "Password reset successfully.", res);
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");

    const { currentPassword, newPassword, confirmNewPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please enter all fields.", 400));
    }

    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Current password is incorrect.", 400));
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
        return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    }

    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("New password & confirm password do not match.", 400));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully.",
    });
});
