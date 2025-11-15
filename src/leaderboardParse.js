/*

Takes in the message !leaderboard

Runs a database query to find all unique usersIDs and return their respective userID and display name.

For each userID, sum up their total points, total guesses, and holeInOne count.

Sort the users by total points (descending), then by total guesses (ascending), then by holeInOne count (descending).

Construct a leaderboard message displaying the rankings, user display names, total points, total guesses, and holeInOne counts.

Sends the constructed leaderboard message back to the Discord channel

*/

const {
  findAllUniqueUserIds,
  findUsersTotalPoints,
} = require("./mongoDatabase");

async function handleLeaderboardMessage(message) {
  if (message.content.toLowerCase().startsWith("!leaderboard")) {
    const userIds = await findAllUniqueUserIds();
    const leaderboardData = [];
    for (const userId of userIds) {
      const userStats = await findUsersTotalPoints(userId);
      if (userStats) {
        leaderboardData.push({
          userId: userId,
          totalPoints: userStats.totalPoints,
          totalGuesses: userStats.totalGuesses,
          holeInOneCount: userStats.holeInOneCount,
        });
      }
    }
    // Sorts the leaderboard data
    leaderboardData.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (a.totalGuesses !== b.totalGuesses) {
        return a.totalGuesses - b.totalGuesses;
      }
      return b.holeInOneCount - a.holeInOneCount;
    });
    // Construct the leaderboard message
    let leaderboardMessage = "**Leaderboard:**\n";
    // Use Promise.all to fetch missing members if not cached
    await Promise.all(
      leaderboardData.map(async (entry, index) => {
        let user = message.guild.members.cache.get(entry.userId);
        if (!user) {
          try {
            user = await message.guild.members.fetch(entry.userId);
          } catch (err) {
            user = null;
          }
        }
        const displayName = user ? user.displayName : "Unknown User";
        leaderboardMessage += `**${index + 1}. ${displayName}** - Points: ${
          entry.totalPoints
        }, Guesses: ${entry.totalGuesses}, Hole-in-Ones: ${
          entry.holeInOneCount
        }\n`;
      })
    );
    // Send the leaderboard message back to the channel
    message.channel.send(leaderboardMessage);
  }
}

module.exports = { handleLeaderboardMessage };
