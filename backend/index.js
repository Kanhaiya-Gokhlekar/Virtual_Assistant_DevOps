import express from "express"
import dotenv from "dotenv"
dotenv.config();
import connectDB from "./config/db.js";
import cors from "cors"
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js"
import geminiResponse from "./gemini.js";
dotenv.config();


const app = express();
const port = process.env.PORT || 10000
app.use(cors(
    {
        origin:"http://localhost:3000",
        credentials:true
    }
))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)


app.listen(port , () =>{
    connectDB()
    console.log(`Server connected on port ${port}`)
});