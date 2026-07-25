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

/**
 * Matches extracted lines against the medicine database using fuzzy matching.
 * 
 * @param {Array<String>} extractedLines - The normalised text lines from OCR
 * @param {Array<Object>} allMedicines - All medicine documents from the DB
 * @returns {Array<Object>} Array of matched OCR entries with confidence scores
 */
exports.findBestMatches = (extractedLines, allMedicines) => {
  const stringSimilarity = require('string-similarity');
  
  if (!extractedLines.length || !allMedicines.length) return [];

  // Create an array of medicine names for comparison
  const medicineNames = allMedicines.map(m => m.name.toLowerCase());
  const matchResults = [];

  extractedLines.forEach(line => {
    // Basic heuristics: if line contains numbers like "500mg", extract the name part for matching
    // But string-similarity works reasonably well with the whole line.
    const match = stringSimilarity.findBestMatch(line, medicineNames);
    const bestMatch = match.bestMatch;
    
    // Set a threshold for what we consider a "match"
    if (bestMatch.rating > 0.4) {
      const matchedMedicine = allMedicines[match.bestMatchIndex];
      
      // Calculate confidence level
      let confidenceLevel = 'LOW';
      if (bestMatch.rating >= 0.8) confidenceLevel = 'HIGH';
      else if (bestMatch.rating >= 0.6) confidenceLevel = 'MEDIUM';

      matchResults.push({
        extractedText: line,
        medicineId: matchedMedicine._id,
        confidenceScore: Math.round(bestMatch.rating * 100),
        confidenceLevel: confidenceLevel,
        isCustomerConfirmed: false,
        quantity: 1 // Default
      });
    } else {
      // Add unmatched line as manual entry suggestion
      matchResults.push({
        extractedText: line,
        medicineId: null,
        confidenceScore: 0,
        confidenceLevel: 'LOW',
        isCustomerConfirmed: false,
        quantity: 1
      });
    }
  });

  return matchResults;
};
