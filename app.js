const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// =========================
// MIDDLEWARES
// =========================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// ROUTES
// =========================
app.use("/users", require("./routes/user.routes"));
app.use("/captains", require("./routes/captain.routes"));
app.use("/maps", require("./routes/maps.routes"));
app.use("/rides", require("./routes/ride.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 API Running Successfully",
  });
});

// =========================
// 404 ROUTE
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;