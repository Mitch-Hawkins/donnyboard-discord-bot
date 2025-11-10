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

module.exports = { run, updateDatabase, findDatesByUserId };
