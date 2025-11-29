// const scheduleNextDay = () => {
//   // Calculate next midnight in Australia/Sydney timezone using Luxon
//   const now = DateTime.now().setZone("Australia/Sydney");
//   const nextMidnight = now.plus({ days: 1 }).startOf("day");
//   const msUntilNextDay = nextMidnight.diff(now).as("milliseconds");

//   setTimeout(async () => {
//     console.log("A new day has started! Handling no-shows...");
//     const todayAEST = DateTime.now()
//       .setZone("Australia/Sydney")
//       .minus({ days: 1 })
//       .toFormat("dd-MM-yyyy");
//     const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
//     handleNoShows(todayAEST, targetChannel).catch((err) =>
//       console.error("Error handling no-shows:", err)
//     );
//     // Schedule again for the following day
//     scheduleNextDay();
//   }, msUntilNextDay);
// };

// // Monthly check interval logic
// let lastMonthTriggered = null;
// function startMonthlyCheck() {
//   // Calculate ms until next midnight in Sydney time
//   const now = DateTime.now().setZone("Australia/Sydney");
//   const nextMidnight = now.plus({ days: 1 }).startOf("day");
//   const msUntilNextMidnight = nextMidnight.diff(now).as("milliseconds");

//   setTimeout(async () => {
//     const now = DateTime.now().setZone("Australia/Sydney");
//     const currentMonth = now.month;
//     const currentYear = now.year;
//     if (
//       now.day === 1 &&
//       lastMonthTriggered !== `${currentYear}-${currentMonth}`
//     ) {
//       try {
//         const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
//         await handleChampionLeaderboardMessage(targetChannel).catch((err) => {
//           console.error("Error handling champion crowning:", err);
//         });
//         lastMonthTriggered = `${currentYear}-${currentMonth}`;
//         console.log("Monthly function triggered for", lastMonthTriggered);
//       } catch (err) {
//         console.error("Error handling month change:", err);
//       }
//     }
//     // Schedule again for the next month
//     startMonthlyCheck();
//   }, msUntilNextMidnight);
// }
