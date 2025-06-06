import React, { createContext, useEffect, useState } from "react";
import axios from "axios"

export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "http://localhost:8080";
  const [userData , setUserData] = useState(null)
  const [frontendImage , setFrontendImage] = useState(null)
  const [backendImage , setBackendImage] = useState(null)
  const [selectedImage , setSelectedImage] = useState(null)

  const handleCurrentUser = async () =>{
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
      setUserData(result.data)
       console.log("User data:", result.data);
    } catch (error) {
      console.log("Axios Error:", error.response?.data || error.message);
      
    }
  }

  const geminiResponse = async (command) => {
    try {
      const response = await axios.post(`${serverUrl}/api/user/asktoassistant`, { command }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error in geminiResponse:", error.response?.data || error.message);
      throw error;
    }
  }

  useEffect(()=>{
    handleCurrentUser()
  },[])
  const value = {
    serverUrl,userData , setUserData,frontendImage , setFrontendImage ,backendImage , setBackendImage,selectedImage , setSelectedImage,geminiResponse
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;
