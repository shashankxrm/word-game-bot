const { isValidLetter } = require("../utils/wordValidator");
const { createLettersRevealedEmbed } = require("../utils/embedBuilder");
const { fetchValidWord, scheduleNextHint } = require("../utils/hintSystem");

/**
 * Handles DM messages for letter submission
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<boolean>} - True if DM was processed, false otherwise
 */
async function handleDMMessage(message, gameState) {
  const content = message.content.trim().toLowerCase();
  const playerId = message.author.id;

  // Check if player is in the game
  if (!gameState.isPlayerInGame(playerId)) {
    return false;
  }

  // Check if player already submitted a letter
  if (gameState.letters[playerId]) {
    await message.channel.send("⚠️ You've already submitted your letter for this round.");
    return true;
  }

  const letter = content[0];
  
  // Validate letter input
  if (!isValidLetter(letter)) {
    await message.channel.send("❌ Invalid input. Please enter just one letter (e.g., `a`).");
    return true;
  }

  // Submit the letter
  gameState.submitLetter(playerId, letter);
  await message.channel.send("✅ Letter received! Waiting for the other player...");

  // Check if both letters are submitted
  if (gameState.areAllLettersSubmitted()) {
    const { start, end } = gameState.getLetters();
    
    // Generate secret word for hint system
    const secretWord = await fetchValidWord(start.toLowerCase(), end.toLowerCase());
    gameState.setCurrentWord(secretWord);
    
    // Start automatic hint scheduling
    if (secretWord) {
      scheduleNextHint(gameState);
    }
    
    const embed = createLettersRevealedEmbed(start, end);
    await gameState.gameChannel.send({ embeds: [embed] });
  }

  return true;
}

module.exports = { handleDMMessage };
