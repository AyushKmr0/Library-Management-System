import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect(process.env.MONGO_URL, {
        dbName: "library_management_system",
    })
    .then(() => {
        console.log(`Database connected successfully...`);
    })
    .catch((error) => {
        console.log(`Error connecting to database ${error}`);
    })
}