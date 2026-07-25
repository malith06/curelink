/**
 * Abstract interface for OCR adapters.
 * Implementations must provide these methods to ensure
 * business logic remains decoupled from specific OCR libraries.
 */
class OcrAdapter {
  /**
   * Extracts raw text from an image or PDF buffer.
   * @param {Buffer} fileBuffer - The file content
   * @param {String} mimeType - The MIME type of the file (e.g. image/jpeg, application/pdf)
   * @returns {Promise<String>} The extracted raw text
   */
  async extractText(fileBuffer, mimeType) {
    throw new Error("Method 'extractText' must be implemented.");
  }
}

module.exports = OcrAdapter;
