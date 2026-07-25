const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Configure memory storage
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// 10 MB default, configurable via env
const MAX_FILE_SIZE = process.env.PRESCRIPTION_MAX_FILE_SIZE_MB 
  ? parseInt(process.env.PRESCRIPTION_MAX_FILE_SIZE_MB) * 1024 * 1024
  : 10 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Unsupported file format. Only JPG, PNG, and PDF are allowed."));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file per request
  },
  fileFilter,
});

// Wrapping the multer upload to handle errors gracefully as requested
const prescriptionUploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("prescription");
  
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(400, `File size cannot exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB.`));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err); // E.g., our custom ApiError from fileFilter
    }
    
    next();
  });
};

module.exports = prescriptionUploadMiddleware;
