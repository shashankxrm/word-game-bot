const { isValidWord, matchesPattern, isValidWordFormat } = require("../utils/wordValidator");
const { createRoundWinnerEmbed } = require("../utils/embedBuilder");
const { sendDMsToPlayers } = require("../utils/dmHandler");

/**
 * Handles word guessing logic
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @param {Object} client - Discord client
 * @returns {Promise<boolean>} - True if word was processed, false otherwise
 */
async function handleWordGuess(message, gameState, client) {
  const content = message.content.trim().toLowerCase();
  const playerId = message.author.id;

  // Check if game is in the right state for word guessing
  if (!gameState.areAllLettersSubmitted() || gameState.wordGuessed) {
    return false;
  }

  // Check if input is a valid word format
  if (!isValidWordFormat(content)) {
    return false;
  }

  const word = content.toLowerCase();
  const { start, end } = gameState.getLetters();

  // Check if word matches the pattern
  if (matchesPattern(word, start, end)) {
    const isValid = await isValidWord(word);
    
    if (isValid) {
      gameState.wordGuessed = true;
      gameState.addScore(playerId);
      gameState.resetHintState(); // Reset hint system
      
      const scoreboard = gameState.getScoreboard();
      const embed = createRoundWinnerEmbed(playerId, word, scoreboard);
      
      // Reset for next round
      gameState.resetRound();
      
      await message.channel.send({ embeds: [embed] });
      
      // Send DMs for next round
      await sendDMsToPlayers(
        client,
        gameState.players,
        "📩 Please reply with your next secret letter.",
        null
      );
      
      return true;
    } else {
      await message.channel.send(`❌ The word **"${word}"** is not valid.`);
      return true;
    }
  }
  
  return false;
}

module.exports = { handleWordGuess };
