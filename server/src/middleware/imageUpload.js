const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Configure memory storage
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// 5 MB default for profile photos
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Unsupported file format. Only JPG, PNG, and WEBP are allowed."));
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

// Wrapping the multer upload to handle errors gracefully
const imageUploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("image");
  
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(400, `File size cannot exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB.`));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    
    next();
  });
};

module.exports = imageUploadMiddleware;
