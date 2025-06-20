import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({ message: "get current user error" })
    }
}

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body
        
        if (!assistantName) {
            return res.status(400).json({ message: "Assistant name is required" })
        }

        const updateData = { assistantName }
        
        if (req.file) {
            try {
                const cloudinaryResult = await uploadOnCloudinary(req.file.path)
                updateData.assistantImage = cloudinaryResult
            } catch (error) {
                console.error("Cloudinary upload error:", error)
                return res.status(400).json({ message: "Failed to upload image" })
            }
        } else if (imageUrl) {
            updateData.assistantImage = imageUrl
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)

    } catch (error) {
        console.error("Update assistant error:", error)
        return res.status(400).json({ message: "Failed to update assistant" })
    }
}

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body
        const user = await User.findById(req.userId);
        user.history.push(command)
        user.save()
        const userName = user.name
        const assistantName = user.assistantName
        const result = await geminiResponse(command, assistantName, userName)

        const jsonMatch = result.match(/{[\s\S]*}/)
        if (!jsonMatch) {
            return res.status(400).json({ response: "Sorry, I couldn't understand that. Please try again." })
        }
        try {
            const gemResult = JSON.parse(jsonMatch[0])
            console.log("Parsed Gemini result:", gemResult)
            const type = gemResult.type

            switch (type) {
                case 'get-date':
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: `Current date is ${moment().format("YYYY-MM-DD")}`
                    });
                case 'get-time':
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: `Current time is ${moment().format("hh:mm A")}`
                    });
                case 'get-day':
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: `Today is ${moment().format("dddd")}`
                    });
                case 'get-month':
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: `Current month is ${moment().format("MMMM")}`
                    });
                case 'google-search':
                case 'youtube-search':
                case 'youtube-play':
                case 'general':
                case "calculator-open":
                case "instagram-open":
                case "facebook-open":
                case "weather-show":
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: gemResult.response,
                    });
                default:
                    return res.status(400).json({ response: "I didn't understand that command. Please try again." })
            }
        } catch (error) {
            console.error("Error parsing Gemini response:", error);
            return res.status(500).json({ response: "Sorry, I encountered an error processing your request." })
        }

    } catch (error) {
        return res.status(500).json({ response: "ask assistant error" })
    }
}
