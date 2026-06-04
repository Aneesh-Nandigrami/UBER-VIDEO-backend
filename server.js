require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

// MongoDB connect
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ DB Error:", err.message);
  });

// export app for vercel
module.exports = app;