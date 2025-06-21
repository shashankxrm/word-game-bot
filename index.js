const { Client, GatewayIntentBits } = require("discord.js");
const https = require("https");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

const token = process.env.TOKEN;

let players = [];
let scores = {};
let letters = {}; // { uniqueKey: letter }
let wordGuessed = false;
let pendingRestart = null;

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  // Start game
  if (content === "!start") {
    players = [message.author.id];
    scores = { [message.author.id]: 0 };
    letters = {};
    wordGuessed = false;
    pendingRestart = null;
    return message.channel.send("🎮 Game started! Waiting for Player 2 to `!join`.");
  }

  // Join game
  if (content === "!join") {
    if (players.length === 1 && !players.includes(message.author.id)) {
      players.push(message.author.id);
      scores[message.author.id] = 0;
      return message.channel.send(
        "✅ Both players joined!\nEach of you: submit your secret letter using `!<letter>` (like `!a`).\nThe bot will reveal both letters once both are received."
      );
    } else {
      return message.channel.send("❗ Game already has two players or you're already in.");
    }
  }

  // Submit letter (e.g., !a)
  if (content.startsWith("!") && content.length === 2 && /^[a-z]$/.test(content[1])) {
    const playerId = message.author.id;

    // Auto add to players if not yet in (solo test)
    if (!players.includes(playerId)) {
      if (players.length < 2) {
        players.push(playerId);
        scores[playerId] = 0;
      } else {
        return message.channel.send("❌ Game already has 2 players.");
      }
    }

    const letterKey = playerId + "_" + Object.keys(letters).length;

    if (Object.values(letters).includes(content[1].toUpperCase())) {
      return message.channel.send("⚠️ You've already submitted a letter.");
    }

    letters[letterKey] = content[1].toUpperCase();
    await message.channel.send("✅ Letter received. Waiting for the other player...");

    if (Object.keys(letters).length === 2) {
      wordGuessed = false;
      const ids = Object.keys(letters);
      const startLetter = letters[ids[0]];
      const endLetter = letters[ids[1]];

      return message.channel.send(
        `🎯 Letters revealed!\nStart letter: **${startLetter}**\nEnd letter: **${endLetter}**\nFirst to type a valid word that starts with **${startLetter}** and ends with **${endLetter}** wins!`
      );
    }
    return;
  }

  // Word guess
  if (Object.keys(letters).length === 2 && !wordGuessed && /^[a-zA-Z]{2,}$/.test(content)) {
    const word = content.toLowerCase();
    const start = Object.values(letters)[0].toLowerCase();
    const end = Object.values(letters)[1].toLowerCase();

    if (word.startsWith(start) && word.endsWith(end)) {
      const valid = await isValidWord(word);
      if (valid) {
        wordGuessed = true;
        scores[message.author.id] = (scores[message.author.id] || 0) + 1;
        return message.channel.send(
          `🎉 <@${message.author.id}> wins with **${word}**!\n📊 Score:\n` +
          players.map((id) => `<@${id}>: ${scores[id] || 0} point(s)`).join("\n")
        );
      } else {
        return message.channel.send(`❌ "${word}" is not a valid dictionary word.`);
      }
    }
  }

  // Scoreboard
  if (content === "!score") {
    if (players.length === 0) return message.channel.send("⚠️ No active game.");
    return message.channel.send(
      "📊 Current Scores:\n" +
      players.map((id) => `<@${id}>: ${scores[id] || 0} point(s)`).join("\n")
    );
  }

  // Reset current round only
  if (content === "!reset") {
    letters = {};
    wordGuessed = false;
    return message.channel.send("🔁 Round reset. Submit new letters like `!a`, `!t`, etc.");
  }

  // Request full game restart
  if (content === "!restart") {
    pendingRestart = message.author.id;
    return message.channel.send(
      "⚠️ Are you sure you want to restart the entire game (clears players and scores)? Type `!confirm` to proceed."
    );
  }

  // Confirm restart
  if (content === "!confirm" && message.author.id === pendingRestart) {
    players = [];
    scores = {};
    letters = {};
    wordGuessed = false;
    pendingRestart = null;
    return message.channel.send("🧼 Game fully restarted. Use `!start` to begin a new game.");
  }

  // Prevent others from confirming someone else's restart
  if (content === "!confirm" && message.author.id !== pendingRestart) {
    return message.channel.send("❌ Only the person who initiated the restart can confirm it.");
  }
});

// Dictionary API check
function isValidWord(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

client.login(token);
