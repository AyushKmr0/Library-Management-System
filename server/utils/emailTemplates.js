export function generateVerificationOtpEmailTemplate(otpCode) {
    return `
    <div
        style="
            font-family: Arial, sans-serif;
            width: lvw;
            /* max-width: 680px; */
            margin: 0 auto;
            padding: 45px 30px 60px;
            background: #f4f7ff;
            font-size: 14px;
            color: #434343;
        "
    >
        <main>
            <div
                style="
                    margin: auto;
                    margin-top: 70px;
                    padding: 92px 30px 115px;
                    max-width: 680px;
                    background: #ffffff;
                    border-radius: 30px;
                    text-align: center;
                "
            >
                <div style="width: 100%; max-width: 489px; margin: 0 auto">
                    <h1
                        style="
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                            color: #1f1f1f;
                        "
                    >
                        Verify Your Email Address
                    </h1>
                    <p
                        style="
                            margin: 0;
                            margin-top: 17px;
                            font-size: 16px;
                            font-weight: 500;
                        "
                    >
                        Dear User,
                    </p>
                    <p
                        style="
                            margin: 0;
                            margin-top: 17px;
                            font-weight: 500;
                            letter-spacing: 0.56px;
                        "
                    >
                        Thank you for choosing. Use the following OTP to
                        complete the procedure to verify your email address
                        for registration or login. OTP is valid for
                        <span style="font-weight: 600; color: #1f1f1f"
                            >15 minutes</span
                        >. Do not share this code with others.
                    </p>
                    <p
                        style="
                            margin: 0;
                            margin-top: 60px;
                            font-size: 40px;
                            font-weight: 600;
                            letter-spacing: 25px;
                            color: #ba3d4f;
                        "
                    >
                        ${otpCode}
                    </p>
                </div>
            </div>

            <p
                style="
                    max-width: 400px;
                    margin: 0 auto;
                    margin-top: 90px;
                    text-align: center;
                    font-weight: 500;
                    color: #8c8c8c;
                "
            >
                Need help? Ask at
                <a href="/" style="color: #499fb6; text-decoration: none"
                    >ayush29292kr@gmail.com</a
                >
                or visit our
                <a
                    href=""
                    target="_blank"
                    style="color: #499fb6; text-decoration: none"
                    ><br />Help Center</a
                >
            </p>
        </main>
        <footer
            style="margin-top: 20px; text-align: center; font-size: 16px"
        >
            <p style="line-height: 2rem">Thank you, <br />Bookworm Team</p>
            <p style="font-size: 12px">
                This is a automated message. Please do not reply to this
                email.
            </p>
        </footer>
    </div>
    `;
}

export const generateForgotPasswordEmailTemplate = (resetPasswordUrl) => `
    <div
        style="
            font-family: Arial, sans-serif;
            width: lvw;
            margin: 0 auto;
            padding: 45px 30px 60px;
            background: #f4f7ff;
            font-size: 14px;
            color: #434343;
        "
    >
        <main>
            <div
                style="
                    margin: auto;
                    margin-top: 70px;
                    padding: 92px 30px 115px;
                    max-width: 680px;
                    background: #ffffff;
                    border-radius: 30px;
                    text-align: center;
                "
            >
                <div style="width: 100%; max-width: 489px; margin: 0 auto">
                    <h1
                        style="
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                            color: #1f1f1f;
                        "
                    >
                        Reset Your Password
                    </h1>
                    <p
                        style="
                            margin: 0;
                            margin-top: 17px;
                            font-size: 16px;
                            font-weight: 500;
                        "
                    >
                        Dear User,
                    </p>
                    <p
                        style="
                            margin: 0;
                            margin-top: 17px;
                            font-weight: 500;
                            letter-spacing: 0.56px;
                        "
                    >
                        We received a request to reset your password. Click the link below to set a new password.
                        The link is valid for
                        <span style="font-weight: 600; color: #1f1f1f"
                            >15 minutes</span
                        >. If you didn’t request a password reset, please ignore this email.
                    </p>
                    <a
                        href="${process.env.FRONTEND_URL}/reset-password/${resetPasswordUrl}"
                        style="
                            display: inline-block;
                            margin-top: 40px;
                            padding: 12px 25px;
                            font-size: 16px;
                            font-weight: 600;
                            color: #ffffff;
                            background-color: #ba3d4f;
                            text-decoration: none;
                            border-radius: 8px;
                        "
                    >
                        Reset Password
                    </a>
                </div>
            </div>

            <p
                style="
                    max-width: 400px;
                    margin: 0 auto;
                    margin-top: 90px;
                    text-align: center;
                    font-weight: 500;
                    color: #8c8c8c;
                "
            >
                Need help? Ask at
                <a href="/" style="color: #499fb6; text-decoration: none"
                    >ayush29292kr@gmail.com</a
                >
                or visit our
                <a
                    href=""
                    target="_blank"
                    style="color: #499fb6; text-decoration: none"
                    ><br />Help Center</a
                >
            </p>
        </main>
        <footer
            style="margin-top: 20px; text-align: center; font-size: 16px"
        >
            <p style="line-height: 2rem">Thank you, <br />Bookworm Team</p>
            <p style="font-size: 12px">
                This is an automated message. Please do not reply to this
                email.
            </p>
        </footer>
    </div>
`;

export const generateReminderEmail = (name, bookTitle, dueDate) => {
    return `
    <div
        style="
            font-family: Arial, sans-serif;
            width: lvw;
            margin: 0 auto;
            padding: 45px 30px 60px;
            background: #f4f7ff;
            font-size: 14px;
            color: #434343;
        "
    >
        <main>
            <div
                style="
                    margin: auto;
                    margin-top: 70px;
                    padding: 92px 30px 115px;
                    max-width: 680px;
                    background: #ffffff;
                    border-radius: 30px;
                    text-align: center;
                "
            >
                <div style="width: 100%; max-width: 489px; margin: 0 auto">
                    <h1
                        style="
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                            color: #1f1f1f;
                        "
                    >
                        Book Return Reminder
                    </h1>
                    <p
                        style="
                            margin: 0;
                            margin-top: 17px;
                            font-size: 16px;
                            font-weight: 500;
                        "
                    >
                        Dear ${name},
                    </p>
                    <p
                        style="
                            margin: 0;
                            margin-top: 17px;
                            font-weight: 500;
                            letter-spacing: 0.56px;
                        "
                    >
                        This is a kind reminder that the book you borrowed,
                        <strong>'${bookTitle}'</strong>, was due for return on
                        <span style="font-weight: 600; color: #1f1f1f"
                            >${dueDate}</span
                        >. Kindly return it at the earliest to avoid any penalties.
                    </p>
                </div>
            </div>

            <p
                style="
                    max-width: 400px;
                    margin: 0 auto;
                    margin-top: 90px;
                    text-align: center;
                    font-weight: 500;
                    color: #8c8c8c;
                "
            >
                Need help? Ask at
                <a href="/" style="color: #499fb6; text-decoration: none"
                    >ayush29292kr@gmail.com</a
                >
                or visit our
                <a
                    href="${process.env.FRONTEND_URL}/help"
                    target="_blank"
                    style="color: #499fb6; text-decoration: none"
                    ><br />Help Center</a
                >
            </p>
        </main>
        <footer
            style="margin-top: 20px; text-align: center; font-size: 16px"
        >
            <p style="line-height: 2rem">Thank you, <br />Bookworm Team</p>
            <p style="font-size: 12px">
                This is an automated message. Please do not reply to this
                email.
            </p>
        </footer>
    </div>
    
`;
};
