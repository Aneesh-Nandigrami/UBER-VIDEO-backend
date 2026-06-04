require("dotenv").config();

const mongoose = require("mongoose");
const serverless = require("serverless-http");
const app = require("../app");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DB_CONNECT, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;

  console.log("✅ MongoDB Connected");

  return cached.conn;
}

// connect DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ DB ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = serverless(app);