export const sendToken = (user, statusCode, message, res) => {
    const token = user.getJWTToken();

    // Convert COOKIE_EXPIRE to a number
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 3;

    res.status(statusCode)
        .cookie("token", token, {
            expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
        })
        .json({
            success: true,
            user,
            message,
            token,
        });
};
