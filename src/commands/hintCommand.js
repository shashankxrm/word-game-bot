const { generateHint, fetchDefinition, scheduleNextHint } = require("../utils/hintSystem");

/**
 * Handles the !hint command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<void>}
 */
async function handleHintCommand(message, gameState) {
  if (!gameState.canGetHint()) {
    return message.channel.send("⚠️ No hint available right now.");
  }

  const newLevel = gameState.incrementHintLevel();
  
  let definition = null;
  if (newLevel === 3) {
    definition = await fetchDefinition(gameState.currentWord);
  }

  const hint = generateHint(gameState.currentWord, newLevel, definition);
  
  if (hint) {
    scheduleNextHint(gameState);
    await message.channel.send(`💡 Hint Level ${newLevel}: ${hint}`);
  } else {
    await message.channel.send("❌ No further hints available.");
  }
}

module.exports = { handleHintCommand };
