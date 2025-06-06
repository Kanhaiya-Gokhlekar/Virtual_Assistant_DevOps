import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcrypt"

export const signUp = async (req , res) => {
    try {
        const {name , email , password} = req.body

        const existUser = await User.findOne({email})
        if (existUser) {
          return res.status(400).json({massage:"email allready exists!"})
        }
        if (password.length<6) {
            return res.status(400).json({message:"Password must be 6 character long"})
        }

        const hashPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            name , password:hashPassword,email,
        })

        const token = await genToken(user._id)
        res.cookie("token", token , {
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"strict",
            secure:false
        })

      return  res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({message:`SignUp error occures ${error}`})
    }
}

export const login = async (req , res) => {
    try {
        const {email , password} = req.body

        const user = await User.findOne({email})
        if (!user) {
          return res.status(400).json({massage:"email not exists!"})
        }
        const isMatch = await bcrypt.compare(password , user.password)
        if (!isMatch) {
            return res.status(400).json({message:"Password dose not match"})
        }


        const token = await genToken(user._id)
        res.cookie("token", token , {
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"strict",
            secure:false
        })

      return  res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({message:`Login  error occures ${error}`})
    }
}

export const logOut = async (req , res) =>{
   try {
       res.clearCookie("token")
       return  res.status(201).json({message:"LogOut Sucessfully"})
   } catch (error) {
    return res.status(500).json({message:`LogOut  error occures ${error}`})
   }
}