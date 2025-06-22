const { sendDMsToPlayers } = require("../utils/dmHandler");

/**
 * Handles the !reset command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @param {Object} client - Discord client
 * @returns {Promise<void>}
 */
async function handleResetCommand(message, gameState, client) {
  gameState.resetRound();
  await message.channel.send("🔁 Round reset. I will DM both players again.");

  await sendDMsToPlayers(
    client,
    gameState.players,
    "🔁 New round! Please reply with your new letter.",
    null
  );
}

module.exports = { handleResetCommand };
