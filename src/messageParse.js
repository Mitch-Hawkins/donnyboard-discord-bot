const { DateTime } = require("luxon");
const { constructDocument } = require("./constructDocument.js");
const { updateDatabase, findDatesByUserId } = require("./mongoDatabase");

async function handleGuessTheGameMessage(message) {
  if (!message.content.startsWith("#GuessTheGame")) return;

  const userId = message.author.id;
  const displayName = message.author.globalName || message.author.username;
  const todayAEST = DateTime.now()
    .setZone("Australia/Sydney")
    .toFormat("dd-MM-yyyy");

  // Check for duplicate submissions
  if (await isDuplicateGuess(userId, todayAEST)) {
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
  const guesses = 7 - points;
  const holeInOne = points === 6 && guesses === 1;

  console.log(`${displayName} scored ${points} point(s) in ${guesses} guesses`);
  if (points === 0) {
    message.reply(
      `${displayName} scored 0 points for the leaderboard! Better luck next time!`
    );
  } else if (holeInOne) {
    message.reply(
      `🎉 ${displayName} scored a hole-in-one with 6 points in 1 guess! 🎉`
    );
  } else if (points !== 1) {
    message.reply(
      `${displayName} scored ${points} point(s) for the leaderboard! Guessed it in ${guesses}`
    );
  } else {
    message.reply(`${displayName} scored ${points} point for the leaderboard!`);
  }

  const userData = {
    userId,
    displayName,
    points,
    guesses,
    holeInOne,
    todayAEST,
  };

  // Construct Guess Document and Update Database
  const document = constructDocument(userData);
  console.log("Constructed Document:", document);
  updateDatabase(document).catch((err) =>
    console.error("Error updating database:", err)
  );
}

// Calculate points based on the emoji line
function calculatePoints(emojiLine) {
  const emojis = emojiLine.split(/\s+/);
  const firstCorrectIndex = emojis.indexOf("🟩");
  if (firstCorrectIndex === -1) {
    return 0;
  }
  const attemptNumber = firstCorrectIndex;
  const points = 7 - attemptNumber; // 6 for first, 5 for second, etc.
  return points;
}

// Check for duplicate guesses
async function isDuplicateGuess(userId, date) {
  const results = await findDatesByUserId(userId, date);
  console.log("Duplicate Check Results:", results);
  if (results.length > 0) {
    return true;
  } else {
    return false;
  }
}

module.exports = { handleGuessTheGameMessage };
