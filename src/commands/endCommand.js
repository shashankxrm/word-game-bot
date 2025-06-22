/**
 * Handles the !end command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<void>}
 */
async function handleEndCommand(message, gameState) {
  if (!gameState.hasActiveGame()) {
    return message.channel.send("⚠️ No active game to end.");
  }

  gameState.endGame();
  await message.channel.send("🛑 **Game ended.** All data has been cleared.\nType `!start` to begin a new game anytime.");
}

module.exports = { handleEndCommand };
