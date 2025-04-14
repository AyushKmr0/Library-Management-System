import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateReminderEmail } from "../utils/emailTemplates.js";

export const notifyUsers = () => {
    cron.schedule("*/30 * * * *", async () => {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const borrowers = await Borrow.find({
                dueDate: { $lt: oneDayAgo },
                returnedDate: null,
                notified: false,
            }).populate("book user");

            for (const element of borrowers) {
                const user = element.user;
                const book = element.book;
                const dueDate = element.dueDate;

                await sendEmail({
                    email: user.email,
                    subject: "Book Return Reminder",
                    message: generateReminderEmail(
                        user.name,
                        book.title,
                        dueDate.toDateString()
                    ),
                });

                element.notified = true;
                await element.save();
                console.log(`email sent to ${user.email}`);
            }
        } catch (error) {
            console.error("Error notifying users:", error);
        }
    });
};
