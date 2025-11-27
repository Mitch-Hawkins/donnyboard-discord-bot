# donnyboard-discord-bot

# TO-DO

- Change Scoring System to just Succeeds or Fails, Guess Difference and Hole in Ones for Tie-Breakers
- For anyone who doesn't guess by the end of the day and is already on the leaderboard for that month, the maximum GuessDifference points are added. (As if they failed that days GTG)
- For someone who makes their first guess at all for the month, after day one, the maximum GuessDifference points * the days it's been since the first of the month are added, plus the GuessDifference points for the guess they are currently submitting.
- !leaderboard should only send the message to be recieved by the person who called the command
- Currently, Fails are adding 7 guess points to guess tally, not 6
- To avoid the wrong days guess being counted, use the GTG Number to calculate if the days game matches up
- Instead of Building a leaderboard manually each time, save a leaderboard as a document for the month
- Change Leaderboard message to be displayed in a table, rather than a list.
- Automatically crowns a champion at the end of each month. Archives the Leaderboard as a seperate .json document. Starts a new leaderboard for the new month. Adds a new Champion (New Type of Document as well?)
