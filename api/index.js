require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../app");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.DB_CONNECT, {
    serverSelectionTimeoutMS: 30000,
  });

  isConnected = true;
  console.log("✅ MongoDB Connected");
}

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};