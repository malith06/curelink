const Tesseract = require("tesseract.js");
const OcrAdapter = require("./ocr.adapter");
const ApiError = require("../../utils/ApiError");

class TesseractAdapter extends OcrAdapter {
  /**
   * Extracts raw text from an image buffer using Tesseract.js.
   * @param {Buffer} fileBuffer - The image content
   * @param {String} mimeType - The MIME type (expected to be an image)
   * @returns {Promise<String>} The extracted raw text
   */
  async extractText(fileBuffer, mimeType) {
    if (!mimeType.startsWith("image/")) {
      throw new ApiError(400, "TesseractAdapter can only process image files.");
    }

    try {
      // Recognize text from buffer using Tesseract.
      // Tesseract.js can accept a Buffer directly in Node.js
      const result = await Tesseract.recognize(fileBuffer, "eng", {
        // Optional logger to track progress if needed in logs
        // logger: m => console.log(m)
      });
      
      return result.data.text;
    } catch (error) {
      throw new ApiError(500, `OCR processing failed: ${error.message}`);
    }
  }
}

module.exports = new TesseractAdapter();
