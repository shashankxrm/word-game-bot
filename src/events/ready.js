/**
 * Handles the ready event when the bot comes online
 * @param {Object} client - Discord client
 * @returns {void}
 */
function handleReady(client) {
  console.log(`🤖 Logged in as ${client.user.tag}`);
}

module.exports = { handleReady };
