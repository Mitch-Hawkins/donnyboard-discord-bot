const { Client, GatewayIntentBits } = require("discord.js");
const { DateTime } = require("luxon");
require("dotenv").config();
const { run } = require("./mongoDatabase");
const { handleGuessTheGameMessage } = require("./messageParse");
const { handleLeaderboardMessage } = require("./leaderboardParse");
const { handleNoShows } = require("./handleNoShows");
const {
  handleChampionLeaderboardMessage,
} = require("./handleChampionLeaderboardMessage");

const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS
  ? process.env.ADMIN_USER_IDS.split(",").map((id) => id.trim())
  : [];

function isAdmin(userId) {
  console.log("Checking admin for userId:", userId);
  console.log("Admin User IDs:", ADMIN_USER_IDS);
  console.log("Is Admin:", ADMIN_USER_IDS.includes(userId));
  return ADMIN_USER_IDS.includes(userId);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await run();
  scheduleNextDay();
});

const scheduleNextDay = () => {
  const now = DateTime.now().setZone("Australia/Sydney");
  const nextMidnight = now.plus({ days: 1 }).startOf("day");
  const msUntilNextDay = nextMidnight.diff(now).as("milliseconds");

  console.log(
    `Next daily cycle scheduled in ${(msUntilNextDay / 1000 / 60).toFixed(
      2
    )} minutes`
  );

  setTimeout(async () => {
    try {
      const now = DateTime.now().setZone("Australia/Sydney");
      const today = now.toFormat("dd-MM-yyyy");
      const yesterday = now.minus({ days: 1 }).toFormat("dd-MM-yyyy");
      const day = now.day;

      console.log(`\nNew Day Trigger — ${today}`);
      console.log(`\nProcessing no-shows for: ${yesterday}`);

      const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);

      // As soon as timeout triggers, handle no-shows for yesterday
      await handleNoShows(yesterday, targetChannel);

      // If this is the first day of the month, we crown a champion
      if (day === 1) {
        console.log("Running monthly champion crowning...");

        await handleChampionLeaderboardMessage(targetChannel);
      }
    } catch (err) {
      console.error("Error in daily/monthly scheduler:", err);
    }

    // Reschedule the next cycle
    scheduleNextDay();
  }, msUntilNextDay);
};

// Respond to messages/commands
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore messages from bots (including itself)
  if (message.channel.id !== TARGET_CHANNEL_ID) return; // Ignore messages from other channels

  if (message.content.toLowerCase() === "!ping") {
    message.reply("pong");
  }

  if (
    message.content.toLowerCase() === "!noshow" &&
    isAdmin(message.author.id)
  ) {
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

  if (
    message.content.toLowerCase() === "!crownchampion" &&
    isAdmin(message.author.id)
  ) {
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
