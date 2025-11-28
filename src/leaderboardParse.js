const { DateTime } = require("luxon");
const { findLeaderboardByMonth } = require("./mongoDatabase");

async function handleLeaderboardMessage(message) {
  if (message.content.toLowerCase().startsWith("!leaderboard")) {
    console.log("Handling leaderboard command...");

    const currentMonth = DateTime.now()
      .setZone("Australia/Sydney")
      .toFormat("MM-yyyy");
    const leaderboard = await findLeaderboardByMonth(currentMonth);
    if (!leaderboard) {
      message.reply(
        "No leaderboard data available for this month yet. Play some games to get started!"
      );
      return;
    }

    const players = leaderboard.players;

    // Sort players by totalPoints (desc), totalGuesses (asc), holeInOneCount (desc)
    players.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints; // Descending points
      }
      if (a.totalGuesses !== b.totalGuesses) {
        return a.totalGuesses - b.totalGuesses; // Ascending guesses
      }
      return b.holeInOneCount - a.holeInOneCount; // Descending hole-in-ones
    });

    let msg = `🏆 **Leaderboard for ${currentMonth}** 🏆\n\n`;
    msg += "```\n";
    msg += padRow("#", "Player", "P", "GD", "HIO") + "\n";
    msg += "-".repeat(34) + "\n";

    players.forEach((p, i) => {
      msg +=
        padRow(
          i + 1,
          p.displayName || "Unknown",
          p.totalPoints,
          p.totalGuesses,
          p.holeInOneCount
        ) + "\n";
    });

    msg += "```";

    message.reply(msg);
  }
}

function padRow(rank, name, pts, guess, hio) {
  return (
    rank.toString().padEnd(2) +
    name.padEnd(14) +
    `| ${pts}`.padEnd(4) +
    `| ${guess}`.padEnd(6) +
    `| ${hio}`
  );
}

module.exports = { handleLeaderboardMessage };
