const { Client, GatewayIntentBits } = require("discord.js");
const { DateTime } = require("luxon");
require("dotenv").config();
const { run } = require("./mongoDatabase");
const { parseMessage, handleGuessTheGameMessage } = require("./messageParse");
const { handleLeaderboardMessage } = require("./leaderboardParse");
const { handleNoShows } = require("./handleNoShows");

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
  scheduleNextDay();
});

// Respond to "ping" messages
client.on("messageCreate", async (message) => {
  // Ignore messages from bots (including itself)
  if (message.author.bot) return;

  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  if (message.content.toLowerCase().includes("!ping")) {
    message.reply("pong");
  }

  if (message.content.startsWith("!noshow")) {
    console.log("Manually Handling no-shows for today...");
    const todayAEST = DateTime.now()
      .setZone("Australia/Sydney")
      .toFormat("dd-MM-yyyy");
    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
    handleNoShows(todayAEST, targetChannel).catch((err) => {
      console.error("Error handling no-shows:", err);
    });
    return;
  }

  // GuessTheGame Message Parser
  handleGuessTheGameMessage(message);
  // Leaderboard Command
  handleLeaderboardMessage(message);
});

const scheduleNextDay = () => {
  // Calculate next midnight in Australia/Sydney timezone using Luxon
  const now = DateTime.now().setZone("Australia/Sydney");
  const nextMidnight = now.plus({ days: 1 }).startOf("day");
  const msUntilNextDay = nextMidnight.diff(now).as("milliseconds");

  setTimeout(async () => {
    console.log("A new day has started! Handling no-shows...");
    const todayAEST = DateTime.now()
      .setZone("Australia/Sydney")
      .toFormat("dd-MM-yyyy");
    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
    handleNoShows(todayAEST, targetChannel).catch((err) =>
      console.error("Error handling no-shows:", err)
    );
    // Schedule again for the following day
    scheduleNextDay();
  }, msUntilNextDay);
};

// Log in to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);
