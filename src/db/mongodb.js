const { MongoClient } = require("mongodb");
require("dotenv").config();

let client;
let db;

async function ensureIndexes(database) {
  const drinks = database.collection("drinks");

  await Promise.all([
    drinks.createIndex({ userId: 1, createdAt: -1 }),
    drinks.createIndex({ userId: 1, brand: 1 }),
    drinks.createIndex({ userId: 1, rating: -1, createdAt: -1 }),
    drinks.createIndex({ userId: 1, caffeineMg: -1, createdAt: -1 }),
  ]);

  console.log("MongoDB indexes ensured for drinks collection");
}

async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) throw new Error("Missing MONGODB_URI in .env");
  if (!dbName) throw new Error("Missing DB_NAME in .env");

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  await ensureIndexes(db);

  console.log(`Connected to MongoDB database: ${dbName}`);
}

function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectToMongo() first.");
  return db;
}

module.exports = { connectToMongo, getDb };