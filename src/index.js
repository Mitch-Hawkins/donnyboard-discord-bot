const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const TARGET_CHANNEL_ID = "1423925443475542118";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Respond to "ping" messages
client.on("messageCreate", (message) => {
  // Ignore messages from bots (including itself)
  if (message.author.bot) return;

  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  if (message.content.toLowerCase().includes("ping")) {
    message.reply("pong");
  }
});

client.login(process.env.DISCORD_TOKEN);
