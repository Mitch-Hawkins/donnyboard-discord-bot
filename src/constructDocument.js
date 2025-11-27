function constructDocument(data) {
  return {
    userId: data.userId,
    displayName: data.displayName,
    points: data.points,
    guesses: data.guesses,
    holeInOne: data.holeInOne,
    createdAt: data.todayAEST, // Current datestamp format: dd-mm-yyyy
  };
}

module.exports = { constructDocument };
