import mongoose from "mongoose"

const connectDb = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in environment variables")
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        await mongoose.connect(process.env.MONGODB_URL, options)
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.error("MongoDB connection error:", error.message)
        // Don't exit the process, let the application handle the error
        throw error
    }
}

export default connectDb