const { getDb } = require("./mongodb");

const COLLECTION = "users";

async function findOrCreateUserFromGoogle(profile) {
  const db = getDb();

  const provider = "google";
  const providerId = profile.id;

  const email =
    Array.isArray(profile.emails) && profile.emails.length > 0
      ? profile.emails[0].value
      : null;

  const displayName = profile.displayName || null;

  const existing = await db.collection(COLLECTION).findOne({ provider, providerId });
  if (existing) return existing;

  const now = new Date().toISOString();

  const doc = {
    provider,
    providerId,
    displayName,
    email,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function getUserById(id) {
  const db = getDb();
  // id here is whatever we store in session (stringified)
  return db.collection(COLLECTION).findOne({ _id: id });
}

module.exports = { findOrCreateUserFromGoogle, getUserById };