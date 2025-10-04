function calculatePoints(emojiLine) {
  // Split the line into individual emojis
  const emojis = emojiLine.split(/\s+/);

  // Find the first correct guess 🟩
  const firstCorrectIndex = emojis.indexOf("🟩");

  if (firstCorrectIndex === -1) {
    return 0;
  }

  // Points = 6 - number of attempts before correct one
  // Attempt numbers start at 0
  const attemptNumber = firstCorrectIndex;
  const points = 7 - attemptNumber; // 6 for first, 5 for second, etc.
  return points;
}

// Parse a message and log the user + points
function handleGuessTheGameMessage(message) {
  // Only handle messages starting with #GuessTheGame
  if (!message.content.startsWith("#GuessTheGame")) return;

  // Split the message into lines
  const lines = message.content.split("\n");

  // Look for the emoji line (usually second line)
  const emojiLine = lines.find(
    (line) =>
      line.includes("🎮") ||
      line.includes("🟥") ||
      line.includes("🟩") ||
      line.includes("🟨")
  );

  if (!emojiLine) return;

  // Calculate points
  const points = calculatePoints(emojiLine);

  // Log or reply
  const user = message.author.username;
  console.log(`${user} scored ${points} point(s)`);
  if (points !== 1) {
    message.reply(`${user} scored ${points} point(s) for the leaderboard!`);
  } else {
    message.reply(`${user} scored ${points} point for the leaderboard!`);
  }
}

module.exports = { handleGuessTheGameMessage };
