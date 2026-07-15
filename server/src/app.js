const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");

// Route files
const auth = require("./routes/auth.routes");

const app = express();

const config = require("./config/env");

app.use(helmet());
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Mount routers
app.use("/api/v1/auth", auth);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CureLink API is running",
  });
});

app.use(errorHandler);

module.exports = app;
