require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

const app = require("./app");
const { initializeSocket } = require("./socket");

const port = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Socket setup
initializeSocket(server);

// MongoDB connection
let isConnected = false;

async function connectToDatabase() {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
    }
}

// Call DB connection
connectToDatabase();

// Start server
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

// Export app for Vercel / testing
module.exports = app;