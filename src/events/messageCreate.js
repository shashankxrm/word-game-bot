const { ChannelType } = require("discord.js");
const { routeCommand } = require("../commands/commandRouter");
const { handleWordGuess } = require("../game/gameLogic");
const { handleDMMessage } = require("../game/dmHandler");

/**
 * Handles message creation events
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @param {Object} client - Discord client
 * @returns {Promise<void>}
 */
async function handleMessageCreate(message, gameState, client) {
  // Ignore bot messages
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  // Handle DM messages
  if (message.channel.type === ChannelType.DM) {
    await handleDMMessage(message, gameState);
    return;
  }

  // Handle commands
  const commandHandled = await routeCommand(content, message, gameState, client);
  if (commandHandled) return;

  // Handle word guessing
  await handleWordGuess(message, gameState, client);
}

module.exports = { handleMessageCreate };
