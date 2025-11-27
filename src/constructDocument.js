function constructGuessDocument(data) {
  return {
    userId: data.userId,
    displayName: data.displayName,
    points: data.points,
    guesses: data.guesses,
    holeInOne: data.holeInOne,
    createdAt: data.todayAEST, // Current datestamp format: dd-mm-yyyy
  };
}

function constructLeaderboardDocument(data) {
  return {
    month: data.month,
    players: data.playersArray,
    lastUpdated: data.lastUpdated // UTC Date/Time Stamp
  }
}

module.exports = { constructGuessDocument, constructLeaderboardDocument };
