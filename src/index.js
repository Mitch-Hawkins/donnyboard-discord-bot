const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { run } = require("./mongoDatabase");
const { parseMessage, handleGuessTheGameMessage } = require("./messageParse");
const { handleLeaderboardMessage } = require("./leaderboardParse");

const TARGET_CHANNEL_ID = "1423925443475542118";

// Set up Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// On bot ready
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await run();
});

// Respond to "ping" messages
client.on("messageCreate", (message) => {
  // Ignore messages from bots (including itself)
  if (message.author.bot) return;

  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  if (message.content.toLowerCase().includes("!ping")) {
    message.reply("pong");
  }

  // GuessTheGame Message Parser
  handleGuessTheGameMessage(message);
  // Leaderboard Command
  handleLeaderboardMessage(message);
});

// Log in to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);
