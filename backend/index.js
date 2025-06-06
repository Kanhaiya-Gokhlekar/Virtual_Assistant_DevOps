import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import geminiResponse from "./gemini.js";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors({
  origin: "https://virtual-assistant-devops-frontend.onrender.com", // You may need to change this for Render
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// ✅ Connect to DB before starting the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server connected on port ${port}`);
  });
}).catch((error) => {
  console.error("Failed to connect to DB", error);
});
