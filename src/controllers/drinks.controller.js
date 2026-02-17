// FILE: src/controllers/drinks.controller.js

const { ObjectId } = require("mongodb");
const { getDb } = require("../db/mongodb");

const COLLECTION = "drinks";

function nowIso() {
  return new Date().toISOString();
}

// Match _id whether it's stored as a string OR an ObjectId
function buildIdQuery(id) {
  const queries = [{ _id: id }]; // string match

  // ObjectId match (only if valid 24-hex string)
  if (ObjectId.isValid(id)) {
    queries.push({ _id: new ObjectId(id) });
  }

  return { $or: queries };
}

async function getAllDrinks(req, res) {
  try {
    const db = getDb();
    const drinks = await db
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(drinks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getDrinkById(req, res) {
  try {
    const db = getDb();
    const id = req.params.id;

    const drink = await db.collection(COLLECTION).findOne(buildIdQuery(id));

    if (!drink) {
      return res.status(404).json({ error: "Drink not found" });
    }

    return res.status(200).json(drink);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createDrink(req, res) {
  try {
    const db = getDb();

    const doc = {
      ...req.body,
      purchasedAt: req.body.purchasedAt ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const result = await db.collection(COLLECTION).insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateDrink(req, res) {
  try {
    const db = getDb();
    const id = req.params.id;

    const updateDoc = {
      ...req.body,
      purchasedAt: req.body.purchasedAt ?? null,
      updatedAt: nowIso(),
    };

    const result = await db.collection(COLLECTION).updateOne(
      buildIdQuery(id),
      { $set: updateDoc }
    );

    // If nothing matched, it truly doesn't exist
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Drink not found" });
    }

    // RUBRIC: PUT returns 204
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


async function deleteDrink(req, res) {
  try {
    const db = getDb();
    const id = req.params.id;

    const result = await db.collection(COLLECTION).deleteOne(buildIdQuery(id));

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Drink not found" });
    }

    // RUBRIC: DELETE returns 200
    return res.status(200).json({ message: "Drink deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllDrinks,
  getDrinkById,
  createDrink,
  updateDrink,
  deleteDrink,
};
