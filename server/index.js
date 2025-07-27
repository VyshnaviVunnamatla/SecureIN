import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: "https://zero-trust-auth-system.vercel.app",  
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log("Backend running on 5000")))
  .catch(err => console.error("DB Connection Failed", err));
