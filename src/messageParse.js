const { DateTime } = require("luxon");

// Store the last submission date for each user
// { userId: 'YYYY-MM-DD' }
const dailySubmissions = {};

function calculatePoints(emojiLine) {
  // Split the line into individual emojis
  const emojis = emojiLine.split(/\s+/);
  const firstCorrectIndex = emojis.indexOf("🟩");
  if (firstCorrectIndex === -1) {
    return 0;
  }
  const attemptNumber = firstCorrectIndex;
  const points = 7 - attemptNumber; // 6 for first, 5 for second, etc.
  return points;
}

function handleGuessTheGameMessage(message) {
  if (!message.content.startsWith("#GuessTheGame")) return;

  const userId = message.author.id;
  const displayName = message.author.globalName || message.author.username;
  const todayAEST = DateTime.now().setZone("Australia/Sydney").toISODate();

  if (dailySubmissions[userId] === todayAEST) {
    message.reply(
      `${displayName}, you've already submitted your guess for today!`
    );
    return;
  }

  // Split the message into lines
  const lines = message.content.split("\n");
  const emojiLine = lines.find(
    (line) =>
      line.includes("🎮") ||
      line.includes("🟥") ||
      line.includes("🟩") ||
      line.includes("🟨")
  );
  if (!emojiLine) return;

  const points = calculatePoints(emojiLine);

  dailySubmissions[userId] = todayAEST;

  //   const user = message.author.username;
  console.log(`${displayName} scored ${points} point(s)`);
  if (points !== 1) {
    message.reply(
      `${displayName} scored ${points} point(s) for the leaderboard!`
    );
  } else {
    message.reply(`${displayName} scored ${points} point for the leaderboard!`);
  }
}

module.exports = { handleGuessTheGameMessage };
