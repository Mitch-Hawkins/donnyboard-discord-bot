const { DateTime } = require("luxon");
const { constructGuessDocument, constructLeaderboardDocument } = require("./constructGuessDocument.js");
const { updateDatabase, findDatesByUserId, findLeaderboardByMonth } = require("./mongoDatabase");

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
  const guesses = calculateGuessDifference(emojiLine);
  const holeInOne = calculateHoleInOne(guesses);

  // Creates feedback message
  console.log(`${displayName} guessed today's game in ${guesses} guesses`);
  if (points === 0) {
    message.reply(
      `${displayName} didn't guess the game today. Better luck next time!`
    );
    guesses = 6;
  } else if (holeInOne) {
    message.reply(
      `🎉 ${displayName} scored a hole-in-one! Got it in one guess! 🎉`
    );
  } else {
    message.reply(`${displayName} guessed today's game in ${guesses} guesses`);
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
  const document = constructGuessDocument(userData);
  console.log("Constructed Guess Document:", document);
  updateDatabase(document, "Guess-the-game").catch((err) =>
    console.error("Error updating database:", err)
  );

  // updateLeaderboardDocument();

}

async function updateLeaderboardDocument() {
  // Query Leaderboard Collection for any existing leaderboard for this month
  const currentMonth = DateTime.now().setZone("Australia/Sydney").toFormat("MM-yyyy");
  const leaderboard = await findLeaderboardByMonth(currentMonth);
  // If a leaderboard exists, Query if the player exists in the leaderboard
  if (leaderboard) {
    const player = leaderboard.players.find(p => p.userId === userId);
    // If player exists, update their points, guesses, holeInOne count
    if (player) {
      player.totalPoints += points;
      player.totalGuesses += guesses;
      if (holeInOne) {
        player.holeInOneCount += 1;
      }
    } else { // If player does not exist, calculate the GuessDifference Debt, add them to the players array and add the debt to the players GuessDifference
      // Calculate GuessDifference Debt
      const currentDay = DateTime.now().setZone("Australia/Sydney").day;
      const guessDifferenceDebt = (currentDay - 1) * 6;

      leaderboard.players.push({
        userId,
        displayName,
        totalPoints: points,
        totalGuesses: guessDifferenceDebt,
        holeInOneCount: holeInOne ? 1 : 0
      });
    }
  } else {
    // else If no leaderboard exists for this month, create a new leaderboard document in the collection for the current month, and this players data as the first entry in the players array
    const newLeaderboard = {
      month: currentMonth,
      players: [{
        userId,
        displayName,
        totalPoints: points,
        totalGuesses: guesses,
        holeInOneCount: holeInOne ? 1 : 0
      }],
      lastUpdated: new Date()
    };
    const leaderboardDocument = constructLeaderboardDocument(newLeaderboard);
    console.log("Constructed Leaderboard Document:", leaderboardDocument);
    updateDatabase(newLeaderboard, "Leaderboard").catch((err) =>
      console.error("Error updating leaderboard database:", err)
    );
  }
}

// Calculate amount of guesses based on the emoji line
function calculateGuessDifference(emojiLine) {
  const emojis = emojiLine.split(/\s+/);
  const firstCorrectIndex = emojis.indexOf("🟩");
  if (firstCorrectIndex === -1) {
    return 0;
  }
  const attemptNumber = firstCorrectIndex;
  const guessDifference = 7 - attemptNumber; // 6 for first, 5 for second, etc.
  return guessDifference;
}

// Calculate points based on presence of green square
function calculatePoints(emojiLine) {
  if (emojiLine.includes("🟩")) {
    return 1;
  } else {
    return 0;
  }
}

// Calculate if hole-in-one
function calculateHoleInOne(points) {
  if (points === 6) {
    return true;
  } else {
    return false;
  }
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
