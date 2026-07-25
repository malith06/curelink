/**
 * Abstract interface for storage adapters.
 * Implementations must provide these methods to ensure
 * business logic remains decoupled from specific storage providers.
 */
class StorageAdapter {
  /**
   * Uploads a file buffer to the storage provider securely.
   * @param {Buffer} fileBuffer - The file content
   * @param {Object} options - Options like mimetype, folder, etc.
   * @returns {Promise<Object>} An object containing publicId, resourceType, format, size, etc.
   */
  async uploadFile(fileBuffer, options) {
    throw new Error("Method 'uploadFile' must be implemented.");
  }

  /**
   * Creates a short-lived, authorised access URL for a secure file.
   * @param {String} fileReference - The storage public identifier
   * @param {Number} expiresInSeconds - Expiration time in seconds
   * @returns {Promise<String>} The signed URL
   */
  async createAuthorisedAccessUrl(fileReference, expiresInSeconds) {
    throw new Error("Method 'createAuthorisedAccessUrl' must be implemented.");
  }

  /**
   * Deletes a file from the storage provider.
   * @param {String} fileReference - The storage public identifier
   * @returns {Promise<void>}
   */
  async deleteFile(fileReference) {
    throw new Error("Method 'deleteFile' must be implemented.");
  }
}

module.exports = StorageAdapter;
