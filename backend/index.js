import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"

const app = express()

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://mern-virtual-assistant.vercel.app"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err)
    res.status(500).json({ message: "Internal server error" })
})

const port = process.env.PORT || 5000

// Start server
const startServer = async () => {
    try {
        // Connect to database first
        await connectDb()
        
        // Then start the server
        app.listen(port, () => {
            console.log(`Server started on port ${port}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

startServer()

