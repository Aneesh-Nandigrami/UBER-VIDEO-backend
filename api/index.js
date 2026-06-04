require("dotenv").config();

const mongoose = require("mongoose");
const serverless = require("serverless-http");
const app = require("../app");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.DB_CONNECT);

  isConnected = true;
  console.log("✅ MongoDB Connected");
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

module.exports = serverless(app);