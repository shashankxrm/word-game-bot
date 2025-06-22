const { createClient } = require("./utils/clientConfig");
const GameState = require("./game/GameState");
const { handleMessageCreate } = require("./events/messageCreate");
const { handleReady } = require("./events/ready");

// Initialize bot components
const client = createClient();
const gameState = new GameState();
const token = process.env.TOKEN;

// Event listeners
client.once("ready", () => {
  handleReady(client);
});

client.on("messageCreate", async (message) => {
  await handleMessageCreate(message, gameState, client);
});

// Start the bot
client.login(token);
