const { DateTime } = require("luxon");
const { findLeaderboardByMonth } = require("./mongoDatabase");

async function handleChampionLeaderboardMessage(channel) {
  console.log("Manually Crowning a Champion...");
  const previousMonth = DateTime.now()
    .setZone("Australia/Sydney")
    .minus({ months: 1 })
    .toFormat("MM-yyyy");
  const leaderboard = await findLeaderboardByMonth(previousMonth);
  if (
    !leaderboard ||
    !leaderboard.players ||
    leaderboard.players.length === 0
  ) {
    await channel.send(
      `No leaderboard data available for ${previousMonth}. Play some games to get started!`
    );
    return;
  }

  const players = [...leaderboard.players];

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

  const champion = players[0];

  let msg = `👑 **Champion of ${previousMonth}** 👑\n\n`;
  msg += `Congratulations to **<@${champion.userId}>**!\n`;
  msg += `You are our GuessTheGame **Champion** for the Month!\n\n`;
  msg += `Points: ${champion.totalPoints}\n`;
  msg += `Total Guesses: ${champion.totalGuesses}\n`;
  msg += `Hole-in-Ones: ${champion.holeInOneCount}\n\n`;
  msg += "----------------------------------";

  await channel.send(msg);

  msg = `🏆 **Final Leaderboard for ${previousMonth}** 🏆\n\n`;
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

  msg += "```\n";
  msg += "Thanks for playing! Let's go again this month!";

  await channel.send(msg);
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

module.exports = { handleChampionLeaderboardMessage };
