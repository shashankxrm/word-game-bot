/**
 * Handles the !restart command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<void>}
 */
async function handleRestartCommand(message, gameState) {
  const playerId = message.author.id;
  gameState.setPendingRestart(playerId);
  await message.channel.send(
    `⚠️ <@${playerId}> wants to fully restart the game. Type \`!confirm\` to proceed.`
  );
}

/**
 * Handles the !confirm command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<void>}
 */
async function handleConfirmCommand(message, gameState) {
  const playerId = message.author.id;
  
  if (gameState.isValidRestart(playerId)) {
    gameState.endGame();
    await message.channel.send("🧼 Game fully restarted. Type `!start` to begin a new game.");
  } else if (gameState.pendingRestart) {
    await message.channel.send("❌ Only the player who requested restart can confirm.");
  }
}

module.exports = { 
  handleRestartCommand,
  handleConfirmCommand 
};
