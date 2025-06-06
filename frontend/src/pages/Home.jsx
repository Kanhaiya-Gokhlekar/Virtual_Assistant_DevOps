import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import userImg from "../assets/user.gif"
import aiImg from "../assets/ai.gif"

function Home() {
  const {userData , serverUrl , setUserData , geminiResponse} = useContext(userDataContext)
  const navigate  = useNavigate()
  const [listening , setListening] = useState(false)
  const [userText , setUserText] = useState("")
  const [aiText , setAiText] = useState("");
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognitionRef=useRef(false)
  const synth = window.speechSynthesis
  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log("Log Out Error",error);
      
    }
  }

  const startRecoginition = ()=>{
    try {
     recognitionRef.current?.start()
     setListening(true)
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition error:",error)
      }
    }
  }
  
const speak = (text)=>{
  const uttrence = new SpeechSynthesisUtterance(text)

  uttrence.lang = 'hi-IN'
  const voice = window.speechSynthesis.getVoices()
  const hindiVoice = voice.find(v => v.lang === 'hi-IN');
  if (hindiVoice) {
    uttrence.voice=hindiVoice
  }

  isSpeakingRef.current=true
  uttrence.onend=()=>{
    setAiText("")
    isSpeakingRef.current=false
    startRecoginition()
  }
  synth.speak(uttrence)
}

const handleCommand = (data) =>{
  const {type, userInput , response} = data
  speak(response)

  if (tupe === 'google-search') {
    const query = encodeURIComponent(userInput)
    window.open(`https://www.google.com/search?q=${query}`,'_blank');
  }
    if (tupe === 'calculator-open') {
    window.open(`https://www.google.com/search?q=calculator`,'_blank');
  }
  if (tupe === 'instagram-open') {
    window.open(`https://www.instagram.com/`,'_blank');
  }
  if (tupe === 'facebook-open') {
    window.open(`https://www.facebook.com/`,'_blank');
  }
  if (tupe === 'weather-show') {
    window.open(`https://www.google.com/search?q=weather`,'_blank');
  }
  if (type === 'youtube-search' || type === 'youtube-play') {
    const query = encodeURIComponent(userInput);
    window.open(`https://www.youtube.com/results?search_query=${query}`,"_blank");
  }
}

useEffect(() => {
  const speechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = true;

  recognitionRef.current=recognition


  const safeRecognition=()=>{
    if (!isSpeakingRef.current && !isRecognitionRef.current) {
      try {
        recognition.start();
        console.log("Recognition requested to start")
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.log("Start error:",err)
        }
      }
    }
  }

  recognition.onstart = ()=>{
    console.log("Recognition Start")
    isRecognitionRef.current=true
    setListening(true);
  }

  recognition.onend = ()=>{
    console.log("Recognition Ended");
    isRecognitionRef.current = false
    setListening(false);

    if (!isSpeakingRef.current) {
      setTimeout(()=>{
        safeRecognition()
      },1000)
    }
  }

  recognition.onerror = (event) =>{
    console.warn("Recognition Error:",event.error);

    isRecognitionRef.current =false
    setListening(false)
    if (event.error !== "aborted" && !isSpeakingRef.current) {
      setTimeout(()=>{
        safeRecognition();
      },1000)
    }
  }

  recognition.onresult= async (e) => { 
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    console.log("Transcript:", transcript);

    if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
      setAiText("")
      setUserText(transcript)
      recognition.stop()
      isRecognitionRef.current=false
      setListening(false)
      const data = await geminiResponse(transcript)
      //console.log(data)
     handleCommand(data)
     setAiText(data.response)
     setUserText("")
    }
  }


  const fallBack = setInterval(()=>{
    if (!isSpeakingRef.current && !isRecognitionRef.current) {
      safeRecognition();
    }
  },1000)

  safeRecognition();
  return ()=>{
    recognition.stop()
    setListening(false)
    isRecognitionRef.current=false
    clearInterval(fallBack)
  }
  
},[])

  return (
    
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col p-[20px] gap-[15px]">

       <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute top-[20px] right-[20px] bg-white rounded-full text-[19px] cursor-pointer" onClick={()=>handleLogout()} >
          Log Out
        </button>

         <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute top-[100px] right-[20px] bg-white rounded-full cursor-pointer text-[19px] px-[20px] py-[10px]" onClick={()=>navigate("/customize")} >
          Customize Your Assistance
        </button>
 
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
           
           <img src={userData?.assistantImage} alt="" className='h-full object-cover' />

      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'am {userData?.assistantName}</h1>
      {!aiText && <img src = {userImg} alt='' className='w-[200px]'/>}
      {aiText && <img src = {aiImg} alt='' className='w-[200px]'/>}

      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
      
    </div>
  )
}

export default Home
