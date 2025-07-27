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
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Backend running on ${PORT}`)))
  .catch(err => console.error("DB Connection Failed", err));

app.get("/", (req, res) => {
  res.send("✅ Zero Trust Backend is Live");
});
