import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"

function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [aiText,setAiText]=useState("")
  const [error,setError]=useState("")
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const [ham,setHam]=useState(false)
  const isRecognizingRef=useRef(false)
  const synth=window.speechSynthesis
  const [speaking, setSpeaking] = useState(false);

  const handleLogOut=async ()=>{
    try {
      await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.error("Logout error:", error)
    }
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        console.log("Recognition started successfully");
      } catch (error) {
        console.error("Recognition start error:", error);
        setError("Failed to start voice recognition. Please check your microphone permissions.");
      }
    } else {
      console.log("Recognition not started - speaking:", isSpeakingRef.current, "recognizing:", isRecognizingRef.current);
    }
  }

  const speak = (text) => {
    try {
      // Stop recognition before speaking
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      isRecognizingRef.current = false;
      setListening(false);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN');
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      isSpeakingRef.current = true;
      setSpeaking(true);
      utterance.onend = () => {
        setAiText("");
        isSpeakingRef.current = false;
        setSpeaking(false);
        setTimeout(() => {
          if (!isSpeakingRef.current) startRecognition(); // Only restart after speech ends
        }, 800);
      };
      synth.cancel();
      synth.speak(utterance);
    } catch {
      setError("Failed to speak. Please check your audio settings.");
    }
  }

  const handleCommand=(data)=>{
    try {
      const {type,userInput,response}=data
      if (type === 'google-search' || type === 'google_search') {
        speak('Searching it on Google');
        if (userInput && userInput.trim() !== "") {
          const query = encodeURIComponent(userInput);
          window.open(`https://www.google.com/search?q=${query}`, '_blank');
        } else {
          window.open(`https://www.google.com/`, '_blank');
        }
        return;
      }
      // For all other types, speak the response and open the relevant site
      speak(response);
      if (type === 'calculator-open' || type === 'calculator_open') {
        window.open(`https://www.google.com/search?q=calculator`, '_blank');
      }
      if (type === "instagram-open" || type === 'instagram_open') {
        window.open(`https://www.instagram.com/`, '_blank');
      }
      if (type ==="facebook-open" || type === 'facebook_open') {
        window.open(`https://www.facebook.com/`, '_blank');
      }
      if (type ==="weather-show" || type === 'weather_show') {
        window.open(`https://www.google.com/search?q=weather`, '_blank');
      }
      if (type === 'youtube-search' || type === 'youtube_search') {
        if (userInput && userInput.trim() !== "") {
          const query = encodeURIComponent(userInput);
          window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        } else {
          window.open(`https://www.youtube.com/`, '_blank');
        }
      }
      if (type === 'youtube-play' || type === 'youtube_play') {
        if (userInput && userInput.trim() !== "") {
          const query = encodeURIComponent(userInput);
          window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        } else {
          window.open(`https://www.youtube.com/`, '_blank');
        }
      }
    } catch {
      setError("Failed to execute command. Please try again.");
    }
  }

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  // Only start recognition after greeting is finished
  const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
  greeting.lang = 'hi-IN';
  greeting.onend = () => {
    startRecognition(); // Listening starts right after greeting
  };
  window.speechSynthesis.speak(greeting);

  // Start recognition after 1 second delay only if component still mounted
  const startTimeout = setTimeout(() => {
    if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognition.start();
        console.log("Recognition requested to start");
      } catch (e) {
        if (e.name !== "InvalidStateError") {
          console.error("Recognition start error:", e);
          setError("Failed to start voice recognition. Please check your microphone permissions.");
        }
      }
    }
  }, 1000);

  recognition.onstart = () => {
    console.log("Recognition onstart triggered");
    isRecognizingRef.current = true;
    setListening(true);
    setError("");
  };

  recognition.onend = () => {
    console.log("Recognition onend triggered");
    isRecognizingRef.current = false;
    setListening(false);
    if (isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted after end");
          } catch (e) {
            console.error("Recognition restart error:", e);
          }
        }
      }, 1000);
    }
  };

  recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error === "not-allowed") {
      setError("Microphone access denied. Please allow microphone access to use voice commands.");
    } else if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (e) {
            console.error("Recognition restart error:", e);
          }
        }
      }, 1000);
    }
  };

  recognition.onresult = async (e) => {
    if (isSpeakingRef.current) return; // Prevent loop: do not process if speaking
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    if (transcript) {
      setAiText("");
      recognition.stop();
      isRecognizingRef.current = false;
      setListening(false);
      try {
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
      } catch {
        setAiText("Sorry, I encountered an error. Please try again.");
        setError("Failed to get response from assistant. Please try again.");
      }
    }
  };

  return () => {
    isMounted = false;
    clearTimeout(startTimeout);
    recognition.stop();
    setListening(false);
    isRecognizingRef.current = false;
  };
}, [getGeminiResponse, userData.name]);




  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
        <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>
        <button className='min-w-[150px] h-[60px]  text-black font-semibold   bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData.history?.map((his, index)=>(
            <div key={index} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
          ))}
        </div>
      </div>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
      
      <div className='flex flex-col items-center gap-2'>
        <h1 className='text-white text-[18px] font-semibold text-wrap'>{aiText ? aiText : null}</h1>
        {listening && (
          <div className='text-white text-[16px] animate-pulse'>
            Listening...
          </div>
        )}
        {speaking && (
          <div className='text-green-400 text-[16px] animate-pulse'>
            Speaking...
          </div>
        )}
        <button
          className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition'
          onClick={startRecognition}
          disabled={listening || speaking}
        >
          {listening ? 'Listening...' : speaking ? 'Speaking...' : '🎤 Start Listening'}
        </button>
        {error && (
          <div className='text-red-500 text-[16px] mt-2'>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home