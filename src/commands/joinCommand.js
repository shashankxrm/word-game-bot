const { sendDMsToPlayers } = require("../utils/dmHandler");

/**
 * Handles the !join command
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @param {Object} client - Discord client
 * @returns {Promise<void>}
 */
async function handleJoinCommand(message, gameState, client) {
  const playerId = message.author.id;
  
  if (gameState.joinGame(playerId)) {
    await message.channel.send(
      `✅ <@${playerId}> has joined!\n📩 I will now DM both players to collect your secret letters.`
    );

    await sendDMsToPlayers(
      client,
      gameState.players,
      "🔤 Please reply with your secret letter for this round (e.g., `a`).",
      message.channel
    );
  } else {
    await message.channel.send("⚠️ Game already has 2 players or you're already in.");
  }
}

module.exports = { handleJoinCommand };
