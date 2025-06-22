const { Client, GatewayIntentBits, Partials } = require("discord.js");

/**
 * Creates and configures the Discord client
 * @returns {Client} - Configured Discord client
 */
function createClient() {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
  });
}

module.exports = { createClient };
