const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const StorageAdapter = require("./storage.adapter");

class CloudinaryStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(fileBuffer, options) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder || "prescriptions",
        type: "private", // Keep files private, not accessible via public URL
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve({
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            size: result.bytes,
            secureUrl: result.secure_url,
          });
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  async createAuthorisedAccessUrl(fileReference, expiresInSeconds = 300) {
    // Generate a signed URL for private access
    const url = cloudinary.utils.private_download_url(
      fileReference,
      fileReference.split(".").pop(), // format
      {
        resource_type: "image", // can also be 'raw' for PDFs depending on upload
        type: "private",
        expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      }
    );
    return url;
  }

  async deleteFile(fileReference) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        fileReference,
        { type: "private" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  }
}

module.exports = new CloudinaryStorageAdapter();
