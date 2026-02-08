const { MongoClient } = require("mongodb");
require("dotenv").config();

let client;
let db;

async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) throw new Error("Missing MONGODB_URI in .env");
  if (!dbName) throw new Error("Missing DB_NAME in .env");

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log(`Connected to MongoDB database: ${dbName}`);
}

function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectToMongo() first.");
  return db;
}

module.exports = { connectToMongo, getDb };
