const { handleStartCommand } = require("./startCommand");
const { handleJoinCommand } = require("./joinCommand");
const { handleScoreCommand } = require("./scoreCommand");
const { handleRulesCommand } = require("./rulesCommand");
const { handleResetCommand } = require("./resetCommand");
const { handleRestartCommand, handleConfirmCommand } = require("./restartCommand");
const { handleEndCommand } = require("./endCommand");
const { handleHintCommand } = require("./hintCommand");

/**
 * Routes commands to their respective handlers
 * @param {string} command - The command to execute
 * @param {Object} message - Discord message object
 * @param {Object} gameState - Game state instance
 * @param {Object} client - Discord client
 * @returns {Promise<boolean>} - True if command was handled, false otherwise
 */
async function routeCommand(command, message, gameState, client) {
  switch (command) {
    case "!start":
      await handleStartCommand(message, gameState);
      return true;
      
    case "!join":
      await handleJoinCommand(message, gameState, client);
      return true;
      
    case "!score":
      await handleScoreCommand(message, gameState);
      return true;
      
    case "!rules":
      await handleRulesCommand(message);
      return true;
      
    case "!reset":
      await handleResetCommand(message, gameState, client);
      return true;
      
    case "!restart":
      await handleRestartCommand(message, gameState);
      return true;
      
    case "!confirm":
      await handleConfirmCommand(message, gameState);
      return true;
      
    case "!hint":
      await handleHintCommand(message, gameState);
      return true;
      
    case "!end":
      await handleEndCommand(message, gameState);
      return true;
      
    default:
      return false;
  }
}

module.exports = { routeCommand };
