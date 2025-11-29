const { Client, GatewayIntentBits } = require("discord.js");
const { DateTime } = require("luxon");
require("dotenv").config();
const { run } = require("./mongoDatabase");
const { parseMessage, handleGuessTheGameMessage } = require("./messageParse");
const { handleLeaderboardMessage } = require("./leaderboardParse");
const { handleNoShows } = require("./handleNoShows");
const {
  handleChampionLeaderboardMessage,
} = require("./handleChampionLeaderboardMessage");

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
  startMonthlyCheck();
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
      .minus({ days: 1 })
      .toFormat("dd-MM-yyyy");
    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
    handleNoShows(todayAEST, targetChannel).catch((err) =>
      console.error("Error handling no-shows:", err)
    );
    // Schedule again for the following day
    scheduleNextDay();
  }, msUntilNextDay);
};

// Monthly check interval logic
let lastMonthTriggered = null;
function startMonthlyCheck() {
  // Calculate ms until next midnight in Sydney time
  const now = DateTime.now().setZone("Australia/Sydney");
  const nextMidnight = now.plus({ days: 1 }).startOf("day");
  const msUntilNextMidnight = nextMidnight.diff(now).as("milliseconds");

  setTimeout(async () => {
    const now = DateTime.now().setZone("Australia/Sydney");
    const currentMonth = now.month;
    const currentYear = now.year;
    if (
      now.day === 1 &&
      lastMonthTriggered !== `${currentYear}-${currentMonth}`
    ) {
      try {
        const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
        await handleChampionLeaderboardMessage(targetChannel).catch((err) => {
          console.error("Error handling champion crowning:", err);
        });
        lastMonthTriggered = `${currentYear}-${currentMonth}`;
        console.log("Monthly function triggered for", lastMonthTriggered);
      } catch (err) {
        console.error("Error handling month change:", err);
      }
    }
    // Schedule again for the next month
    startMonthlyCheck();
  }, msUntilNextMidnight);
}

// Respond to messages/commands
client.on("messageCreate", async (message) => {
  // Ignore messages from bots (including itself)
  if (message.author.bot) return;

  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  if (message.content.toLowerCase().startsWith("!ping")) {
    message.reply("pong");
  }

  if (message.content.startsWith("!noshow")) {
    console.log("Manually Handling no-shows for today...");
    const todayAEST = DateTime.now()
      .setZone("Australia/Sydney")
      .minus({ days: 1 })
      .toFormat("dd-MM-yyyy");
    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
    handleNoShows(todayAEST, targetChannel).catch((err) => {
      console.error("Error handling no-shows:", err);
    });
    return;
  }

  if (message.content.startsWith("!crownchampion")) {
    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
    await handleChampionLeaderboardMessage(targetChannel).catch((err) => {
      console.error("Error handling champion crowning:", err);
    });
    return;
  }

  // GuessTheGame Message Parser
  handleGuessTheGameMessage(message);
  // Leaderboard Command
  handleLeaderboardMessage(message);
});

// Log in to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);
