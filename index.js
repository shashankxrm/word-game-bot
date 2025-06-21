const { Client, GatewayIntentBits, Partials, ChannelType } = require("discord.js");
const https = require("https");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const token = process.env.TOKEN;

let players = [];
let scores = {};
let letters = {};
let wordGuessed = false;
let gameChannel = null;
let pendingRestart = null;

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();
  const playerId = message.author.id;

  // 🟣 Handle DM for letter submission
  if (message.channel.type === ChannelType.DM) {
    if (!players.includes(playerId)) return;

    if (letters[playerId]) {
      return message.channel.send("⚠️ You’ve already submitted your letter for this round.");
    }

    const letter = content[0];
    if (!/^[a-zA-Z]$/.test(letter)) {
      return message.channel.send("❌ Invalid input. Please enter just one letter (e.g., `a`).");
    }

    letters[playerId] = letter.toUpperCase();
    await message.channel.send("✅ Letter received! Waiting for the other player...");

    if (Object.keys(letters).length === 2) {
      const startLetter = letters[players[0]];
      const endLetter = letters[players[1]];
      wordGuessed = false;

      return gameChannel.send(
        `🎯 **Letters revealed!**\n🅰️ Start letter: **${startLetter}**\n🅾️ End letter: **${endLetter}**\n\n🏁 First to type a **valid English word** that starts with **${startLetter}** and ends with **${endLetter}** wins this round!`
      );
    }

    return;
  }

  // 🔷 Server-side commands

  if (content === "!start") {
    players = [playerId];
    scores = { [playerId]: 0 };
    letters = {};
    wordGuessed = false;
    gameChannel = message.channel;
    pendingRestart = null;

    return message.channel.send(
      `🎮 **Game Started!**\n<@${playerId}> has initiated a new game.\n\n🔹 Another player, type \`!join\` to join.\n🔸 Once both players join, you’ll receive a **DM to privately submit your letter**.\n🏁 First to submit a valid word using both letters wins the round!`
    );
  }

  if (content === "!join") {
    if (players.length === 1 && !players.includes(playerId)) {
      players.push(playerId);
      scores[playerId] = 0;

      message.channel.send(
        `✅ <@${playerId}> has joined!\n📩 I will now DM both players to collect your secret letters.`
      );

      for (const id of players) {
        try {
          const user = await client.users.fetch(id);
          await user.send("🔤 Please reply with your secret letter for this round (e.g., `a`).");
        } catch (err) {
          console.error(`Could not DM player ${id}`, err);
          message.channel.send(`⚠️ <@${id}>, I couldn't DM you. Please enable DMs from server members.`);
        }
      }

      return;
    } else {
      return message.channel.send("⚠️ Game already has 2 players or you're already in.");
    }
  }

  // 📊 Show score
  if (content === "!score") {
    if (players.length === 0) return message.channel.send("⚠️ No active game.");
    const scoreMsg = players.map(id => `👤 <@${id}>: ${scores[id] || 0} point(s)`).join("\n");
    return message.channel.send(`📊 **Scoreboard:**\n${scoreMsg}`);
  }

  // 🆕 Word submission (in server)
  if (Object.keys(letters).length === 2 && !wordGuessed && /^[a-zA-Z]{2,}$/.test(content)) {
    const word = content.toLowerCase();
    const start = letters[players[0]].toLowerCase();
    const end = letters[players[1]].toLowerCase();

    if (word.startsWith(start) && word.endsWith(end)) {
      const isValid = await isValidWord(word);
      if (isValid) {
        wordGuessed = true;
        scores[playerId] = (scores[playerId] || 0) + 1;
        const scoreMsg = players.map(id => `👤 <@${id}>: ${scores[id]} point(s)`).join("\n");

        // Reset round
        letters = {};
        wordGuessed = false;

        return message.channel.send(
          `🎉 <@${playerId}> wins with the word **"${word}"**!\n\n📊 **Scoreboard:**\n${scoreMsg}\n\n🔁 New round auto-started. I will DM you for next letters.`
        ).then(async () => {
          for (const id of players) {
            try {
              const user = await client.users.fetch(id);
              await user.send("📩 Please reply with your next secret letter.");
            } catch (err) {
              console.error(`Failed to DM ${id} again.`);
            }
          }
        });
      } else {
        return message.channel.send(`❌ The word **"${word}"** is not valid.`);
      }
    }
  }

  // 🔁 Reset round
  if (content === "!reset") {
    letters = {};
    wordGuessed = false;
    message.channel.send("🔁 Round reset. I will DM both players again.");

    for (const id of players) {
      try {
        const user = await client.users.fetch(id);
        user.send("🔁 New round! Please reply with your new letter.");
      } catch (err) {
        console.error(`DM failed for ${id}`);
      }
    }

    return;
  }

  // 🔄 Restart entire game
  if (content === "!restart") {
    pendingRestart = playerId;
    return message.channel.send(
      `⚠️ <@${playerId}> wants to fully restart the game. Type \`!confirm\` to proceed.`
    );
  }

  if (content === "!confirm" && playerId === pendingRestart) {
    players = [];
    scores = {};
    letters = {};
    wordGuessed = false;
    gameChannel = null;
    pendingRestart = null;
    return message.channel.send("🧼 Game fully restarted. Type `!start` to begin a new game.");
  }

  if (content === "!confirm" && playerId !== pendingRestart) {
    return message.channel.send("❌ Only the player who requested restart can confirm.");
  }
});

// ✅ Word dictionary check
function isValidWord(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

client.login(token);
