const { createScoreboardEmbed } = require("../utils/embedBuilder");

/**
 * Handles the !score command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @returns {Promise<void>}
 */
async function handleScoreCommand(message, gameState) {
  if (!gameState.hasActiveGame()) {
    return message.channel.send("⚠️ No active game.");
  }
  
  const scoreboard = gameState.getScoreboard();
  const embed = createScoreboardEmbed(scoreboard);
  await message.channel.send({ embeds: [embed] });
}

module.exports = { handleScoreCommand };
