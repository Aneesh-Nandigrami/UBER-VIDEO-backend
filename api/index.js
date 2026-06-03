require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../app");

let isConnected = false;

// DB CONNECTION (SAFE FOR VERCEL)
async function connectDB() {
  if (isConnected) return;

  if (!process.env.DB_CONNECT) {
    throw new Error("DB_CONNECT missing in environment variables");
  }

  await mongoose.connect(process.env.DB_CONNECT, {
    serverSelectionTimeoutMS: 30000,
  });

  isConnected = true;
  console.log("✅ MongoDB Connected");
}

// Vercel Serverless Export
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("❌ Server Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};