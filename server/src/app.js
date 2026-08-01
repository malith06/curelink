const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");

const notFound = require("./middleware/notFound.middleware");

// Route files
const auth = require("./routes/auth.routes");
const health = require("./routes/health.routes");
const pharmacy = require("./modules/pharmacies/pharmacy.routes");
const adminPharmacy = require("./modules/admin/admin.pharmacy.routes");
const medicine = require("./modules/medicines/medicine.routes");
const availability = require("./modules/availability/availability.routes");
const request = require("./modules/requests/request.routes");
const prescription = require("./modules/prescriptions/prescription.routes");
const quotation = require("./modules/quotations/quotation.routes");
const { customerOrderRouter, pharmacyOrderRouter } = require("./modules/orders/order.routes");

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
app.use("/api/v1/pharmacies", pharmacy);
app.use("/api/v1/admin/pharmacies", adminPharmacy);
app.use("/api/v1/medicines", medicine);
app.use("/api/v1/availability", availability);
app.use("/api/v1/requests", request);
app.use("/api/v1/prescriptions", prescription);
app.use("/api/v1/quotations", quotation);
app.use("/api/v1/orders", customerOrderRouter);
app.use("/api/v1/pharmacy/orders", pharmacyOrderRouter);

// Handle undefined routes
app.use(notFound);

app.use(errorHandler);

module.exports = app;
