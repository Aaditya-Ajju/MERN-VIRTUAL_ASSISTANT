# Virtual Assistant (Voice AI)

A full-stack voice-enabled virtual assistant web app using React (Vite) for the frontend and Node.js/Express for the backend. The assistant can answer questions, open Google/YouTube/Facebook/Instagram/Calculator/Weather, and more, using natural language voice commands.

---

## Features

- **Voice Recognition:** Speak naturally to the assistant; it listens and responds.
- **Custom Greeting:** Greets the user on page load and starts listening automatically.
- **Google Search:** For any general question (e.g., "Who is Virat Kohli?"), the assistant says "Searching it on Google" and opens the Google search results in a new tab.
- **YouTube, Facebook, Instagram, Calculator, Weather:**
  - Commands like "open YouTube", "play [song] on YouTube", "open Facebook", etc., open the relevant site in a new tab and speak a short response.
- **No Looping:** Robust logic prevents the assistant from listening to its own voice and getting stuck in a loop.
- **Simple, Clean UI:** Shows assistant image, name, and clear listening/speaking indicators.
- **Authentication & Customization:** User signup/signin, and assistant customization (name, image).
- **History:** View your previous queries in the sidebar.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Setup the Backend
```bash
cd backend
npm install
```

#### Create a `.env` file in the backend directory:
```
PORT=8000
MONGODB_URL="<your-mongodb-connection-string>"
JWT_SECRET="<your-jwt-secret>"
CLOUDINARY_CLOUD_NAME='<your-cloudinary-cloud-name>'
CLOUDINARY_API_KEY='<your-cloudinary-api-key>'
CLOUDINARY_API_SECRET='<your-cloudinary-api-secret>'
GEMINI_API_URL="<your-gemini-api-url>"
```

#### Start the backend:
```bash
npm run dev
# or
node index.js
```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

- The frontend will run on [http://localhost:5173](http://localhost:5173)
- The backend will run on [http://localhost:8000](http://localhost:8000)

---

## Usage
1. Open the frontend in your browser.
2. Sign up or sign in.
3. Customize your assistant (name, image).
4. The assistant will greet you and start listening automatically.
5. Speak your command (e.g., "Who is Virat Kohli?", "open YouTube", "play Shape of You on YouTube").
6. The assistant will respond and open the relevant site in a new tab if needed.

---

## Functionality Details
- **Voice Recognition:** Uses browser's SpeechRecognition API for real-time voice input.
- **Intent Detection:** Uses Gemini API to classify user intent (search, play, open, etc.).
- **Google Search:** For any unknown or general question, opens Google search and says "Searching it on Google".
- **YouTube/Facebook/Instagram/Calculator/Weather:** Opens the relevant site in a new tab and speaks a short response.
- **Loop Prevention:** Ensures the assistant never listens to its own voice.
- **Customizable Assistant:** Users can set their own assistant name and image.
- **Authentication:** Secure signup/signin with JWT and MongoDB.
- **History:** Sidebar shows your previous queries.

---

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT
- **Cloud Storage:** Cloudinary (for assistant images)
- **AI:** Gemini API (Google)

---

## Author
**Aaditya Raj**  
📞 Phone: 9798503975  
✉️ Email: revengeraaditya@gmail.com  
🔗 LinkedIn: [www.linkedin.com/in/aaditya-raj-klu](https://www.linkedin.com/in/aaditya-raj-klu)

---

## License
This project is for educational and personal use. 