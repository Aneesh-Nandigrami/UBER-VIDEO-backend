require("dotenv").config();
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const app = require("../app");

let isConnected = false;

// MongoDB connection
async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.DB_CONNECT);

  isConnected = true;
  console.log("✅ MongoDB Connected");
}

// Attach DB middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Export for Vercel
module.exports = serverless(app);