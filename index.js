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
let letters = {};
let wordGuessed = false;
let pendingRestart = null;

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();
  const playerId = message.author.id;

  // 🎮 Start a new game
  if (content === "!start") {
    players = [playerId];
    scores = { [playerId]: 0 };
    letters = {};
    wordGuessed = false;
    pendingRestart = null;
    return message.channel.send(
      `🎮 **Game Started!**\n<@${playerId}> has initiated a new game.\n\n🔹 Another player, type \`!join\` to join.\n🔸 Once both players join, you'll each submit **one secret letter** (e.g., \`!a\`).\n🔹 The bot will reveal both letters only **after both are submitted**.\n🏁 Then, first to type a valid English word that starts and ends with those letters **wins the round!**`
    );
  }

  // ✅ Player joins
  if (content === "!join") {
    if (players.length === 1 && !players.includes(playerId)) {
      players.push(playerId);
      scores[playerId] = 0;
      return message.channel.send(
        `✅ <@${playerId}> has joined!\n\n🔤 Both players, now submit **one secret letter** each using \`!<letter>\` (like \`!s\`).\n🤐 The bot will only reveal letters when both are submitted.`
      );
    } else {
      return message.channel.send("⚠️ Game already has 2 players or you're already in.");
    }
  }

  // 🔠 Letter submission
  if (content.startsWith("!") && content.length === 2 && /^[a-z]$/.test(content[1])) {
    if (!players.includes(playerId)) {
      return message.channel.send("❌ You are not part of the current game.");
    }

    if (letters[playerId]) {
      return message.channel.send("⚠️ You've already submitted your letter for this round.");
    }

    letters[playerId] = content[1].toUpperCase();
    await message.channel.send("✅ Letter received. Waiting for the other player...");

    if (Object.keys(letters).length === 2) {
      wordGuessed = false;
      const startLetter = letters[players[0]];
      const endLetter = letters[players[1]];

      return message.channel.send(
        `🎯 **Letters revealed!**\n🅰️ Start letter: **${startLetter}**\n🅾️ End letter: **${endLetter}**\n\n🏁 First to type a **valid English word** that starts with **${startLetter}** and ends with **${endLetter}** wins this round!`
      );
    }
    return;
  }

  // 💬 Word submission
  if (Object.keys(letters).length === 2 && !wordGuessed && /^[a-zA-Z]{2,}$/.test(content)) {
    const word = content.toLowerCase();
    const start = letters[players[0]].toLowerCase();
    const end = letters[players[1]].toLowerCase();

    if (word.startsWith(start) && word.endsWith(end)) {
      const valid = await isValidWord(word);
      if (valid) {
        wordGuessed = true;
        scores[playerId] = (scores[playerId] || 0) + 1;

        const scoreMsg = players
          .map((id) => `👤 <@${id}>: ${scores[id] || 0} point(s)`)
          .join("\n");

        // Reset round
        letters = {};
        wordGuessed = false;

        return message.channel.send(
          `🎉 <@${playerId}> wins with the word **"${word}"**!\n\n📊 **Scoreboard:**\n${scoreMsg}\n\n🔁 New round auto-started. Submit your next letters using \`!<letter>\`.`
        );
      } else {
        return message.channel.send(`❌ The word **"${word}"** is not a valid dictionary word.`);
      }
    }
  }

  // 📊 Show scores
  if (content === "!score") {
    if (players.length === 0) return message.channel.send("⚠️ No active game yet.");
    const scoreMsg = players
      .map((id) => `👤 <@${id}>: ${scores[id] || 0} point(s)`)
      .join("\n");
    return message.channel.send(`📊 **Current Scores:**\n${scoreMsg}`);
  }

  // 🔁 Reset current round only
  if (content === "!reset") {
    letters = {};
    wordGuessed = false;
    return message.channel.send("🔁 Round reset. Both players, submit new letters with `!<letter>`.");
  }

  // 🔄 Restart whole game
  if (content === "!restart") {
    pendingRestart = playerId;
    return message.channel.send(
      `⚠️ <@${playerId}> wants to fully restart the game (clears players & scores).\nType \`!confirm\` to proceed.`
    );
  }

  if (content === "!confirm" && playerId === pendingRestart) {
    players = [];
    scores = {};
    letters = {};
    wordGuessed = false;
    pendingRestart = null;
    return message.channel.send("🧼 Game fully restarted. Type `!start` to begin a new game.");
  }

  if (content === "!confirm" && playerId !== pendingRestart) {
    return message.channel.send("❌ Only the person who initiated the restart can confirm it.");
  }
});

// 🌐 Validate word using public dictionary API
function isValidWord(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

client.login(token);
