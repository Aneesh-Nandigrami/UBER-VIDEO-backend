const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.VITE_BASE_URL
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/users", require("./routes/user.routes"));
app.use("/captains", require("./routes/captain.routes"));
app.use("/maps", require("./routes/maps.routes"));
app.use("/rides", require("./routes/ride.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

// Test route
app.get("/", (req, res) => {
  res.send("🚀 API Running Successfully");
});

module.exports = app;