/**
 * Sends DMs to players for letter submission
 * @param {Client} client - Discord client
 * @param {Array} playerIds - Array of player IDs
 * @param {string} message - Message to send
 * @param {Object} channel - Channel to send error messages to
 */
async function sendDMsToPlayers(client, playerIds, message, channel) {
  for (const id of playerIds) {
    try {
      const user = await client.users.fetch(id);
      await user.send(message);
    } catch (err) {
      console.error(`Could not DM player ${id}`, err);
      if (channel) {
        channel.send(`⚠️ <@${id}>, I couldn't DM you. Please enable DMs from server members.`);
      }
    }
  }
}

/**
 * Sends a DM to a specific player
 * @param {Client} client - Discord client
 * @param {string} playerId - Player ID
 * @param {string} message - Message to send
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function sendDMToPlayer(client, playerId, message) {
  try {
    const user = await client.users.fetch(playerId);
    await user.send(message);
    return true;
  } catch (err) {
    console.error(`Failed to DM ${playerId}`, err);
    return false;
  }
}

module.exports = {
  sendDMsToPlayers,
  sendDMToPlayer
};
