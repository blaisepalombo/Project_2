const { Router } = require("express");
const drinksRouter = require("./drinks.routes");

const router = Router();

router.use("/drinks", drinksRouter);

module.exports = router;
