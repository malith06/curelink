/**
 * Normalises raw OCR text to extract potential medicine names.
 * Removes unnecessary special characters, normalises whitespace,
 * and splits text into lines.
 * 
 * @param {String} rawText 
 * @returns {Array<String>} Array of potential medicine names (lines)
 */
exports.extractPotentialMedicineNames = (rawText) => {
  if (!rawText) return [];

  // 1. Split by newlines
  const lines = rawText.split(/\r?\n/);

  // 2. Clean and normalise each line
  const cleanedLines = lines.map(line => {
    return line
      .toLowerCase()
      // Remove common OCR artifacts and non-alphanumeric characters (keep spaces and hyphens)
      .replace(/[^a-z0-9\s-]/g, ' ')
      // Replace multiple spaces with a single space
      .replace(/\s+/g, ' ')
      .trim();
  });

  // 3. Filter out empty lines, very short strings, or common non-medicine words
  // (e.g. "dr", "date", "age", "name", etc.)
  const excludeWords = ['dr', 'date', 'age', 'name', 'patient', 'sex', 'rx', 'prescription'];
  
  return cleanedLines.filter(line => {
    if (line.length < 3) return false;
    
    // Check if the entire line is just an excluded word
    const isExcluded = excludeWords.some(word => line === word || line.startsWith(`${word} `));
    if (isExcluded) return false;
    
    return true;
  });
};
