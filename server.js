require("dotenv").config();
const mongoose = require("mongoose");

const app = require("./app");

// MongoDB connection
let isConnected = false;

async function connectDB() {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.DB_CONNECT);

        isConnected = true;

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Error:", error);
    }
}

connectDB();

// IMPORTANT FOR VERCEL
module.exports = app;