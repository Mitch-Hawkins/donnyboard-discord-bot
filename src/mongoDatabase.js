const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbName = "Donnyboard";
const collectionName = "Guess-the-game";

let isConnected = false;
// Connect to MongoDB
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
async function updateDatabase(document) {
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

// Find documents by userId and date
async function findDatesByUserId(userId, date) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  const query = { userId: userId, createdAt: date };
  const results = await collection.find(query).toArray();
  return results;
}

// Find all unique userIds in the collection
async function findAllUniqueUserIds() {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  // Use aggregation to group by userId and return unique userIds
  const results = await collection
    .aggregate([{ $group: { _id: "$userId" } }])
    .toArray();
  // Return array of userIds
  return results.map((doc) => doc._id);
}

// Find user's total points, total guesses, and holeInOne count
async function findUsersTotalPoints(userId) {
  if (!isConnected) {
    await run();
  }
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  const aggregationPipeline = [
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$userId",
        totalPoints: { $sum: "$points" },
        totalGuesses: { $sum: "$guesses" },
        holeInOneCount: {
          $sum: {
            $cond: ["$holeInOne", 1, 0],
          },
        },
      },
    },
  ];
  const results = await collection.aggregate(aggregationPipeline).toArray();
  return results[0];
}

module.exports = {
  run,
  updateDatabase,
  findDatesByUserId,
  findAllUniqueUserIds,
  findUsersTotalPoints,
};
