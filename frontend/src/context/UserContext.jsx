import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'

export const userDataContext = createContext()

function UserContext({children}) {
    const serverUrl = import.meta.env.VITE_BACKEND_URL || "https://mern-virtual-assistant.onrender.com"
    const [userData, setUserData] = useState(null)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [loading, setLoading] = useState(true)

    const handleCurrentUser = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/current`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            setUserData(result.data)
        } catch (error) {
            console.error("Auth error:", error.response?.data?.message || error.message)
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }

    const getGeminiResponse = async (command) => {
        try {
            const result = await axios.post(
                `${serverUrl}/api/user/asktoassistant`,
                { command },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            return result.data
        } catch (error) {
            console.error("Gemini API error:", error.response?.data?.message || error.message)
            throw error
        }
    }

    useEffect(() => {
        handleCurrentUser()
    }, [])

    const value = {
        serverUrl,
        userData,
        setUserData,
        backendImage,
        setBackendImage,
        frontendImage,
        setFrontendImage,
        selectedImage,
        setSelectedImage,
        getGeminiResponse,
        loading
    }

    return (
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
    )
}

export default UserContext
