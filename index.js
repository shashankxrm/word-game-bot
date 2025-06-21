const { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder } = require("discord.js");
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

      const embed = new EmbedBuilder()
        .setTitle("🎯 Letters Revealed!")
        .setColor(0xfacc15)
        .addFields(
          { name: "💬 Start Letter", value: startLetter, inline: true },
          { name: "💬 End Letter", value: endLetter, inline: true }
        )
        .setDescription("🏁 First to type a **valid English word** using the above letters wins this round!");

      return gameChannel.send({ embeds: [embed] });
    }

    return;
  }

  if (content === "!start") {
    players = [playerId];
    scores = { [playerId]: 0 };
    letters = {};
    wordGuessed = false;
    gameChannel = message.channel;
    pendingRestart = null;

    const embed = new EmbedBuilder()
      .setTitle("🎮 Game Started!")
      .setDescription(`<@${playerId}> has initiated a new game.`)
      .addFields(
        { name: "🔹 Waiting for Player 2", value: "Type `!join` to join the game." },
        { name: "📩 DM Phase", value: "Both players will receive a **DM** to submit a secret letter." },
        { name: "🏁 Objective", value: "Form a **valid English word** using those letters — first to do so wins!" }
      )
      .setColor(0x00b0f4);

    return message.channel.send({ embeds: [embed] });
  }

  if (content === "!rules") {
    const embed = new EmbedBuilder()
      .setTitle("📜 Game Rules")
      .setDescription(`
1️⃣ Type \`!start\` to begin a new game. Another player must type \`!join\` to participate.
2️⃣ You will be DM’d to submit one secret letter each.
3️⃣ Bot reveals both letters once both are submitted.
4️⃣ First to type a valid English word using those letters wins.
5️⃣ Type \`!score\` to check current scores.
6️⃣ Use \`!reset\` to start a new round with same players.
7️⃣ Use \`!restart\` + \`!confirm\` to reset players and scores.
8️⃣ Use \`!end\` to stop the game entirely.

🎯 Example:
Letters A and E → Valid word: **apple**
Letters D and G → Valid word: **dog**

Good luck and have fun! 🎉`)
      .setColor(0x5865f2);

    return message.channel.send({ embeds: [embed] });
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

  if (content === "!score") {
    if (players.length === 0) return message.channel.send("⚠️ No active game.");
    const scoreMsg = players.map(id => `👤 <@${id}>: ${scores[id] || 0} point(s)`).join("\n");
    const embed = new EmbedBuilder()
      .setTitle("📊 Scoreboard")
      .setDescription(scoreMsg)
      .setColor(0x2ecc71);
    return message.channel.send({ embeds: [embed] });
  }

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

        letters = {};
        wordGuessed = false;

        const embed = new EmbedBuilder()
          .setTitle("🎉 Round Winner!")
          .setColor(0x57f287)
          .setDescription(`<@${playerId}> wins with the word **\"${word}\"**!`)
          .addFields(
            { name: "📊 Scoreboard", value: scoreMsg },
            { name: "🔁 New Round", value: "DMs sent to both players for the next secret letters." }
          );

        return message.channel.send({ embeds: [embed] }).then(async () => {
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
        return message.channel.send(`❌ The word **\"${word}\"** is not valid.`);
      }
    }
  }

  if (content === "!end") {
    if (players.length === 0) {
      return message.channel.send("⚠️ No active game to end.");
    }

    players = [];
    scores = {};
    letters = {};
    wordGuessed = false;
    gameChannel = null;
    pendingRestart = null;

    return message.channel.send("🛑 **Game ended.** All data has been cleared.\nType `!start` to begin a new game anytime.");
  }

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

function isValidWord(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

client.login(token);
