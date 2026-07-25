const pdfParse = require("pdf-parse");
const OcrAdapter = require("./ocr.adapter");
const ApiError = require("../../utils/ApiError");

class PdfAdapter extends OcrAdapter {
  /**
   * Extracts raw text from a PDF buffer using pdf-parse.
   * @param {Buffer} fileBuffer - The PDF content
   * @param {String} mimeType - The MIME type (expected to be application/pdf)
   * @returns {Promise<String>} The extracted raw text
   */
  async extractText(fileBuffer, mimeType) {
    if (mimeType !== "application/pdf") {
      throw new ApiError(400, "PdfAdapter can only process PDF files.");
    }

    try {
      const data = await pdfParse(fileBuffer);
      const text = data.text ? data.text.trim() : "";
      
      if (!text) {
        // Fallback or warning when PDF contains only images and no embedded text.
        // For MVP, we instruct the customer to upload images or manual entry.
        throw new ApiError(400, "Could not extract text from PDF. Ensure it contains text, or try uploading an image format (JPG/PNG).");
      }
      
      return text;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `PDF text extraction failed: ${error.message}`);
    }
  }
}

module.exports = new PdfAdapter();
