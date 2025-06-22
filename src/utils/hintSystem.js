const https = require("https");

/**
 * Fetches a valid word from Datamuse API that starts and ends with given letters
 * @param {string} startLetter - The starting letter
 * @param {string} endLetter - The ending letter
 * @returns {Promise<string|null>} - A random valid word or null
 */
function fetchValidWord(startLetter, endLetter) {
  return new Promise((resolve) => {
    const url = `https://api.datamuse.com/words?sp=${startLetter}*${endLetter}&max=50`;
    https.get(url, (res) => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => {
        try {
          const data = JSON.parse(raw);
          const words = data.map(entry => entry.word).filter(w => /^[a-z]+$/.test(w));
          resolve(words[Math.floor(Math.random() * words.length)] || null);
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

/**
 * Fetches dictionary definition for a word
 * @param {string} word - The word to get definition for
 * @returns {Promise<string|null>} - The definition or null
 */
function fetchDefinition(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    https.get(url, (res) => {
      let data = '';
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const def = parsed[0]?.meanings?.[0]?.definitions?.[0]?.definition;
          resolve(def || null);
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

/**
 * Generates a hint based on the word and hint level
 * @param {string} word - The target word
 * @param {number} level - The hint level (1-n)
 * @param {string|null} definition - Optional definition for level 3
 * @returns {string|null} - The hint text or null
 */
function generateHint(word, level, definition = null) {
  if (!word) return null;

  const len = word.length;

  switch (level) {
    case 1:
      return `The word has **${len} letters**.`;

    case 2:
      return `Jumbled hint: \`${shuffleWord(word)}\``;

    case 3:
      return definition ? `Definition: *${definition}*` : null;

    case 4:
      return `Hint: \`${maskPattern(word)}\``;

    default:
      return `Hint: \`${revealRandomLetters(word, level - 4)}\``;
  }
}

/**
 * Shuffles the letters of a word randomly
 * @param {string} word - The word to shuffle
 * @returns {string} - The shuffled word
 */
function shuffleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Creates a pattern showing vowels and hiding consonants
 * @param {string} word - The word to mask
 * @returns {string} - The masked word pattern
 */
function maskPattern(word) {
  return word.split('').map(ch => /[aeiou]/i.test(ch) ? ch : '_').join('');
}

/**
 * Reveals random letters in the word, hiding the rest
 * @param {string} word - The word to reveal letters from
 * @param {number} revealCount - Number of letters to reveal
 * @returns {string} - The word with some letters revealed
 */
function revealRandomLetters(word, revealCount) {
  const indices = Array.from({ length: word.length }, (_, i) => i);
  const revealed = new Set();

  while (revealed.size < Math.min(revealCount, word.length)) {
    const idx = indices[Math.floor(Math.random() * indices.length)];
    revealed.add(idx);
  }

  return word.split('').map((ch, i) => revealed.has(i) ? ch : '_').join('');
}

/**
 * Schedules the next automatic hint
 * @param {Object} gameState - Game state instance
 * @param {number} delay - Delay in milliseconds (default: 10000)
 * @returns {void}
 */
function scheduleNextHint(gameState, delay = 10000) {
  gameState.clearHintTimeout();
  
  const timeout = setTimeout(async () => {
    if (!gameState.wordGuessed && gameState.currentWord && gameState.gameChannel) {
      const newLevel = gameState.incrementHintLevel();

      let definition = null;
      if (newLevel === 3) {
        definition = await fetchDefinition(gameState.currentWord);
      }

      const hint = generateHint(gameState.currentWord, newLevel, definition);

      if (hint) {
        await gameState.gameChannel.send(`💡 Hint Level ${newLevel}: ${hint}`);
        scheduleNextHint(gameState, delay);
      }
    }
  }, delay);

  gameState.setHintTimeout(timeout);
}

module.exports = {
  fetchValidWord,
  fetchDefinition,
  generateHint,
  shuffleWord,
  maskPattern,
  revealRandomLetters,
  scheduleNextHint
};
