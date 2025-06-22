const { createGameStartEmbed } = require("../utils/embedBuilder");

/**
 * Handles the !start command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<void>}
 */
async function handleStartCommand(message, gameState) {
  const playerId = message.author.id;
  
  gameState.startGame(playerId, message.channel);
  
  const embed = createGameStartEmbed(playerId);
  await message.channel.send({ embeds: [embed] });
}

module.exports = { handleStartCommand };
