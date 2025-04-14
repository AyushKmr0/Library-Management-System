import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(
            new ErrorHandler(
                "User is not authenticated or already logged out.",
                400
            )
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    req.user = user;
    next();
});

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Access denied: Role '${
                        req.user?.role || "unknown"
                    }' is not allowed.`,
                    403
                )
            );
        }
        next();
    };
};
