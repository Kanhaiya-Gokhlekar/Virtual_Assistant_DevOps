import User from "../models/user.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import  geminiResponse  from "../gemini.js";
import moment from "moment"
export const getCurrentUser = async (req , res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({message:"current user not found"})
        }
       return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({message:"Current user error"})
    }
}

export const updateAssistant = async (req , res ) =>{
    try {
        const {assistantName , imageUrl} = req.body
        let assistantImage;
        if(req.file) {
            console.log("File received:", req.file);
            console.log("Body data:", req.body);
            assistantImage=await uploadOnCloudinary(req.file.path) 
        }else {
            assistantImage = imageUrl
        }

        const user = await User.findByIdAndUpdate(req.userId , {
            assistantName , assistantImage
        }, {new:true}).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({message:"Update Assistant  user error"})
    }
}
export const askToAssistant = async (req , res) => {
    try {
        const {command} = req.body
        const user = await User.findById(req.userId).select("-password");
        user.history.push(command)
        user.save()
        const userName = user.name;
        const assistantName = user.assistantName;
        const result = await geminiResponse(command, assistantName, userName    );
        const jsonMatch = result.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.status(400).json({message:"Invalid response format from assistant"});
            
        }

        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type;

        switch (type) {
            case 'get-date':
                return res.json({
                    type,
                usrInput: gemResult.userInput,
                response:`current date is ${moment().format('YYYY-MM-DD')}`
                });
            case 'get-time':
                return res.json({
                    type,
                    usrInput: gemResult.userInput,
                    response:`current time is ${moment().format('HH:mm:A')}`
                });
            case 'get-day':
                return res.json({
                    type,
                    usrInput: gemResult.userInput,
                    response:`Today is ${moment().format('dddd')}`
                });
            case 'get-month':
                return res.json({
                    type,
                    usrInput: gemResult.userInput,
                    response:`Current month is ${moment().format('MMMM')}`
                });
            case 'general':
            case 'google-search':
            case 'youtube-search':
            case 'youtube-play':
            case 'calculator-open':
            case 'instagram-open':
            case 'facebook-open':
            case 'weather-show':
                return res.json({
                    type,
                    usrInput: gemResult.userInput,
                    response: gemResult.response
                });
            default:
                return res.status(400).json({message:"Unknown type from assistant"});
        }
    } catch (error) {
        return res.status(500).json({message:"Ask to assistant error"})
    }
}
