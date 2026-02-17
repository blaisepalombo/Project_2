// FILE: src/routes/drinks.routes.js

const { Router } = require("express");
const {
  getAllDrinks,
  getDrinkById,
  createDrink,
  updateDrink,
  deleteDrink,
} = require("../controllers/drinks.controller");

const { validateDrink } = require("../middleware/validateDrink");

const router = Router();

/**
 * GET /drinks
 * @summary Get all drink logs
 * @tags Drinks
 */
router.get("/", getAllDrinks);

/**
 * GET /drinks/{id}
 * @summary Get a drink log by ID
 * @tags Drinks
 * @param {string} id.path.required - Drink ID
 */
router.get("/:id", getDrinkById);

/**
 * POST /drinks
 * @summary Create a new drink log
 * @tags Drinks
 * @param {object} request.body.required - Drink to create
 * @example request.body
 * {
 *   "brand": "C4",
 *   "drinkName": "Cereal Killer",
 *   "sizeOz": 16,
 *   "caffeineMg": 200,
 *   "sugarG": 0,
 *   "purchasedAt": "2026-02-07T15:30:00Z",
 *   "rating": 7,
 *   "notes": "Sweet and strong"
 * }
 */
router.post("/", validateDrink, createDrink);

/**
 * PUT /drinks/{id}
 * @summary Update a drink log by ID
 * @tags Drinks
 * @param {string} id.path.required - Drink ID
 * @param {object} request.body.required - Updated drink
 * @example request.body
 * {
 *   "brand": "C4",
 *   "drinkName": "Frozen Bombsicle",
 *   "sizeOz": 16,
 *   "caffeineMg": 200,
 *   "sugarG": 0,
 *   "purchasedAt": null,
 *   "rating": 7,
 *   "notes": "Updated via PUT"
 * }
 */
router.put("/:id", validateDrink, updateDrink);

/**
 * DELETE /drinks/{id}
 * @summary Delete a drink log by ID
 * @tags Drinks
 * @param {string} id.path.required - Drink ID
 */
router.delete("/:id", deleteDrink);

module.exports = router;
