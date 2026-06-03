require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(
      process.env.DB_CONNECT,
      {
        serverSelectionTimeoutMS: 30000,
      }
    );

    isConnected = db.connections[0].readyState === 1;

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    throw error;
  }
}

// IMPORTANT FOR VERCEL
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
};

// LOCAL DEVELOPMENT ONLY
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}