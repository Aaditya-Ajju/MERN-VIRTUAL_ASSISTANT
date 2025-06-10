import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ message: "Authentication required" })
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined")
            return res.status(500).json({ message: "Server configuration error" })
        }

        try {
            const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)
            req.userId = verifyToken.userId
            next()
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Session expired" })
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Invalid token" })
            }
            throw error
        }
    } catch (error) {
        console.error("Auth middleware error:", error)
        return res.status(500).json({ message: "Authentication error" })
    }
}

export default isAuth
