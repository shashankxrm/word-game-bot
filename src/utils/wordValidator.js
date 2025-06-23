const https = require("https");

/**
 * Validates if a word is a valid English word using the dictionary API
 * @param {string} word - The word to validate
 * @returns {Promise<boolean>} - True if the word is valid, false otherwise
 */
function isValidWordInDictionary(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

/**
 * Validates if a word exists in Datamuse API
 * @param {string} word - The word to validate
 * @returns {Promise<boolean>} - True if the word exists in Datamuse, false otherwise
 */
function isValidWordInDatamuse(word) {
  return new Promise((resolve) => {
    const url = `https://api.datamuse.com/words?sp=${word}&max=1`;
    https.get(url, (res) => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => {
        try {
          const data = JSON.parse(raw);
          const exactMatch = data.find(entry => entry.word.toLowerCase() === word.toLowerCase());
          resolve(!!exactMatch);
        } catch {
          resolve(false);
        }
      });
    }).on("error", () => resolve(false));
  });
}

/**
 * Validates if a word is valid in either Dictionary API or Datamuse API
 * @param {string} word - The word to validate
 * @returns {Promise<boolean>} - True if the word is valid in at least one API, false otherwise
 */
async function isValidWord(word) {
  try {
    const [dictionaryValid, datamuseValid] = await Promise.all([
      isValidWordInDictionary(word),
      isValidWordInDatamuse(word)
    ]);
    
    // Return true if valid in either API
    return dictionaryValid || datamuseValid;
  } catch (error) {
    console.error("Error validating word:", error);
    return false;
  }
}

/**
 * Validates if a word matches the game rules (starts with first letter, ends with second letter)
 * @param {string} word - The word to check
 * @param {string} startLetter - The starting letter
 * @param {string} endLetter - The ending letter
 * @returns {boolean} - True if the word matches the pattern
 */
function matchesPattern(word, startLetter, endLetter) {
  const lowerWord = word.toLowerCase();
  const lowerStart = startLetter.toLowerCase();
  const lowerEnd = endLetter.toLowerCase();
  
  return lowerWord.startsWith(lowerStart) && lowerWord.endsWith(lowerEnd);
}

/**
 * Validates if the input is a single letter
 * @param {string} input - The input to validate
 * @returns {boolean} - True if it's a single letter
 */
function isValidLetter(input) {
  return /^[a-zA-Z]$/.test(input);
}

/**
 * Validates if the input is a valid word format (2+ letters, only alphabetic)
 * @param {string} input - The input to validate
 * @returns {boolean} - True if it's a valid word format
 */
function isValidWordFormat(input) {
  return /^[a-zA-Z]{2,}$/.test(input);
}

module.exports = {
  isValidWord,
  matchesPattern,
  isValidLetter,
  isValidWordFormat
};
