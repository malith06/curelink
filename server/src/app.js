const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");

const notFound = require("./middleware/notFound.middleware");

// Route files
const auth = require("./routes/auth.routes");
const health = require("./routes/health.routes");

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
app.use("/api/v1/health", health);

// Handle undefined routes
app.use("*", notFound);

app.use(errorHandler);

module.exports = app;
