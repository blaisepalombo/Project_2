function validateDrink(req, res, next) {
  let { brand, drinkName, sizeOz } = req.body;

  if (!brand || typeof brand !== "string") {
    return res.status(400).json({ error: "brand is required and must be a string" });
  }
  if (!drinkName || typeof drinkName !== "string") {
    return res.status(400).json({ error: "drinkName is required and must be a string" });
  }

  // allow "16" -> 16
  if (sizeOz === undefined || sizeOz === null) {
    return res.status(400).json({ error: "sizeOz is required" });
  }
  if (typeof sizeOz === "string" && sizeOz.trim() !== "" && !Number.isNaN(Number(sizeOz))) {
    req.body.sizeOz = Number(sizeOz);
    sizeOz = req.body.sizeOz;
  }
  if (typeof sizeOz !== "number" || Number.isNaN(sizeOz)) {
    return res.status(400).json({ error: "sizeOz must be a number" });
  }

  next();
}

module.exports = { validateDrink };
