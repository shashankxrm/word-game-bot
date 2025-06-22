const { createRulesEmbed } = require("../utils/embedBuilder");

/**
 * Handles the !rules command
 * @param {Object} message - Discord message object
 * @returns {Promise<void>}
 */
async function handleRulesCommand(message) {
  const embed = createRulesEmbed();
  await message.channel.send({ embeds: [embed] });
}

module.exports = { handleRulesCommand };
