const { DateTime } = require("luxon");
const {
  findLeaderboardByMonth,
  findGuessesByDate,
  appendLeaderboardDocument,
} = require("./mongoDatabase");

// Handles no-shows for a given month and dateOkHo
async function handleNoShows(date, channel) {
  const currentMonth = DateTime.now()
    .setZone("Australia/Sydney")
    .toFormat("MM-yyyy");
  const leaderboard = await findLeaderboardByMonth(currentMonth);
  console.log("Current Month:", currentMonth);
  console.log("Fetched Leaderboard:", leaderboard);
  if (!leaderboard || !leaderboard.players) return;

  // Get all unique userIds from leaderboard players
  const userIds = [
    ...new Set(leaderboard.players.map((player) => player.userId)),
  ];
  console.log("All User IDs from Leaderboard:", userIds);

  // Get all guesses for the specified date
  const guesses = await findGuessesByDate(date);
  const guessedUserIds = new Set(guesses.map((guess) => guess.userId));

  // Find userIds without a guess entry for the date
  const noShowUserIds = userIds.filter((userId) => !guessedUserIds.has(userId));
  console.log("No-Show User IDs for date", date, ":", noShowUserIds);

  // Add a no-show entry for each userId
  for (const userId of noShowUserIds) {
    // await addNoShowToLeaderboard(month, userId, date);

    // Find the player in the leaderboard and add +6 to their totalGuesses
    const player = leaderboard.players.find((p) => p.userId === userId);
    if (player) {
      player.totalGuesses = (player.totalGuesses || 0) + 6;
    }
    leaderboard.lastUpdated = new Date();
    await appendLeaderboardDocument(currentMonth, leaderboard).catch((err) =>
      console.error("Error appending no-show to leaderboard document:", err)
    );
    console.log(`Added no-show for userId: ${userId} on date: ${date}`);
  }

  if (noShowUserIds.length > 0 && channel) {
    const noShowMentions = noShowUserIds.map((id) => `<@${id}>`).join(", ");
    const noShowMessage = `The following users were marked as no-shows for ${date} and have been assigned +6 guesses: ${noShowMentions}`;
    channel.send(noShowMessage);
  }
}

module.exports = { handleNoShows };
