import axios from "axios"

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL
    if (!apiUrl) {
      throw new Error("GEMINI_API_URL is not configured")
    }

    const prompt = `You are a smart virtual assistant named ${assistantName}, created by ${userName}.
You are not Google. You behave like a voice-enabled assistant.

Your job is to understand the user's natural language input (in English, Hindi, or a mix) and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<the main query or search text>",
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- If the user says anything like 'open YouTube', 'YouTube kholo', 'YouTube open karo', or similar, always use type "youtube-search" (with empty userInput) and response "Opening YouTube." (even if the command is in Hindi or a mix)
- If the user says anything like 'open Facebook', 'Facebook kholo', 'Facebook open karo', or similar, always use type "facebook-open" and response "Opening Facebook."
- If the user says anything like 'open Instagram', 'Instagram kholo', 'Instagram open karo', or similar, always use type "instagram-open" and response "Opening Instagram."
- If the user says anything like 'open calculator', 'calculator kholo', 'calculator open karo', or similar, always use type "calculator-open" and response "Opening calculator."
- If the user says anything like 'show weather', 'weather dikhao', 'weather batao', or similar, always use type "weather-show" and response "Showing weather."
- For 'play ... on YouTube', use type "youtube-play" and set userInput to the song or video name only.
- For Google search, use type "google-search" and set userInput to the search query.
- For factual questions you know, use type "general" and give a short answer. If you don't know, use type "google-search".
- If you do not understand the command, default to type "google-search" and set userInput to the original command.
- Always use the exact type values as shown above (with hyphens, not underscores).
- Only respond with the JSON object, nothing else.
- Make sure the response is a valid JSON object.

User input: ${command}
`;

    const result = await axios.post(apiUrl, {
      "contents": [{
        "parts": [{"text": prompt}]
      }]
    })

    if (!result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API")
    }

    const response = result.data.candidates[0].content.parts[0].text
    console.log("Raw Gemini response:", response)

    // Try to parse the response to ensure it's valid JSON
    try {
      const jsonMatch = response.match(/{[\s\S]*}/)
      if (!jsonMatch) {
        throw new Error("No JSON object found in response")
      }
      JSON.parse(jsonMatch[0]) // Validate JSON format
      return response
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError)
      throw new Error("Invalid JSON response from Gemini")
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw error
  }
}

export default geminiResponse