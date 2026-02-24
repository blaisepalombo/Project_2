const { Router } = require("express");
const drinksRouter = require("./drinks.routes");
const authRouter = require("./auth.routes");

const router = Router();

router.use("/drinks", drinksRouter);
router.use("/auth", authRouter);

module.exports = router;