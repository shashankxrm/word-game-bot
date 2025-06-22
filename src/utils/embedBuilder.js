const { EmbedBuilder } = require("discord.js");

/**
 * Creates an embed for game start
 * @param {string} playerId - The player who started the game
 * @returns {EmbedBuilder} - The embed object
 */
function createGameStartEmbed(playerId) {
  return new EmbedBuilder()
    .setTitle("🎮 Game Started!")
    .setDescription(`<@${playerId}> has initiated a new game.`)
    .addFields(
      { name: "🔹 Waiting for Player 2", value: "Type `!join` to join the game." },
      { name: "📩 DM Phase", value: "Both players will receive a **DM** to submit a secret letter." },
      { name: "🏁 Objective", value: "Form a **valid English word** using those letters — first to do so wins!" }
    )
    .setColor(0x00b0f4);
}

/**
 * Creates an embed for letters revealed
 * @param {string} startLetter - The starting letter
 * @param {string} endLetter - The ending letter
 * @returns {EmbedBuilder} - The embed object
 */
function createLettersRevealedEmbed(startLetter, endLetter) {
  return new EmbedBuilder()
    .setTitle("🎯 Letters Revealed!")
    .setColor(0xfacc15)
    .addFields(
      { name: "💬 Start Letter", value: startLetter, inline: true },
      { name: "💬 End Letter", value: endLetter, inline: true }
    )
    .setDescription("🏁 First to type a **valid English word** using the above letters wins this round!\nUse `!hint` to get a clue.");
}

/**
 * Creates an embed for round winner
 * @param {string} playerId - The winning player ID
 * @param {string} word - The winning word
 * @param {Array} scoreboard - Array of player scores
 * @returns {EmbedBuilder} - The embed object
 */
function createRoundWinnerEmbed(playerId, word, scoreboard) {
  const scoreMsg = scoreboard.map(player => `👤 <@${player.id}>: ${player.score} point(s)`).join("\n");
  
  return new EmbedBuilder()
    .setTitle("🎉 Round Winner!")
    .setColor(0x57f287)
    .setDescription(`<@${playerId}> wins with the word **"${word}"**!`)
    .addFields(
      { name: "📊 Scoreboard", value: scoreMsg },
      { name: "🔁 New Round", value: "DMs sent to both players for the next secret letters." }
    );
}

/**
 * Creates an embed for scoreboard
 * @param {Array} scoreboard - Array of player scores
 * @returns {EmbedBuilder} - The embed object
 */
function createScoreboardEmbed(scoreboard) {
  const scoreMsg = scoreboard.map(player => `👤 <@${player.id}>: ${player.score} point(s)`).join("\n");
  
  return new EmbedBuilder()
    .setTitle("📊 Scoreboard")
    .setDescription(scoreMsg)
    .setColor(0x2ecc71);
}

/**
 * Creates an embed for game rules
 * @returns {EmbedBuilder} - The embed object
 */
function createRulesEmbed() {
  return new EmbedBuilder()
    .setTitle("📜 Game Rules")
    .setDescription(`
1️⃣ Type \`!start\` to begin a new game. Another player must type \`!join\` to participate.
2️⃣ You will be DM'd to submit one secret letter each.
3️⃣ Bot reveals both letters once both are submitted.
4️⃣ First to type a valid English word using those letters wins.
5️⃣ Type \`!score\` to check current scores.
6️⃣ Use \`!hint\` to get a clue during the round.
7️⃣ Use \`!reset\` to start a new round with same players.
8️⃣ Use \`!restart\` + \`!confirm\` to reset players and scores.
9️⃣ Use \`!end\` to stop the game entirely.

🎯 Example:
Letters A and E → Valid word: **apple**
Letters D and G → Valid word: **dog**

Good luck and have fun! 🎉`)
    .setColor(0x5865f2);
}

module.exports = {
  createGameStartEmbed,
  createLettersRevealedEmbed,
  createRoundWinnerEmbed,
  createScoreboardEmbed,
  createRulesEmbed
};
