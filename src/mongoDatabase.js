const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbName = "Donnyboard";
const guessesCollection = "Guess-the-game";
const leaderboardCollection = "Leaderboard";

let isConnected = false;
async function run() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  }
}

// Update database with a new document
async function updateDatabase(document, collectionName) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  const result = await collection.insertOne(document);
  console.log(
    `New document inserted with the following id: ${result.insertedId}`
  );
}

// Append leaderboard document for the month
async function appendLeaderboardDocument(month, newLeaderboard) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(leaderboardCollection);
  const filter = { month: month };
  const storedId = newLeaderboard._id;
  delete newLeaderboard._id; // Remove _id to avoid ImmutableField error
  const plainLeaderbaord = JSON.parse(JSON.stringify(newLeaderboard));
  const result = await collection.replaceOne(filter, plainLeaderbaord, {
    upsert: true,
  });
  console.log(
    `Leaderboard document updated with the following id: ${storedId}`
  );
}

// Find documents by userId and date
async function findDatesByUserId(userId, date) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(guessesCollection);
  const query = { userId: userId, createdAt: date };
  const results = await collection.find(query).toArray();
  return results;
}

// Find all guesses for a specific date
async function findGuessesByDate(date) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(guessesCollection);
  const query = { createdAt: date };
  const results = await collection.find(query).toArray();
  return results;
}

// Find leaderboard for a specific month
async function findLeaderboardByMonth(month) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(leaderboardCollection);
  const query = { month: month };
  const result = await collection.findOne(query);
  return result;
}

module.exports = {
  run,
  updateDatabase,
  appendLeaderboardDocument,
  findDatesByUserId,
  findLeaderboardByMonth,
  findGuessesByDate,
};
