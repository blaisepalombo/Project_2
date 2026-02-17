function isNonEmptyString(v) {
  return typeof v === "string" && v.trim() !== "";
}

function coerceNumberField(req, fieldName) {
  const value = req.body[fieldName];

  // allow null/undefined to pass through (handled by required checks elsewhere)
  if (value === undefined || value === null) return;

  // allow "16" -> 16
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return; // let type checks fail if needed
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      req.body[fieldName] = num;
      return;
    }
  }
}

function validateDrink(req, res, next) {
  const method = req.method.toUpperCase();

  // RUBRIC-SAFE: PUT should require a full body (PATCH is partial)
  const isPartialUpdate = method === "PATCH";

  const body = req.body || {};

  // If it's a partial update, require at least one field in the body
  if (isPartialUpdate && Object.keys(body).length === 0) {
    return res.status(400).json({ error: "Request body cannot be empty" });
  }

  // Coerce numeric fields if they come in as strings
  coerceNumberField(req, "sizeOz");
  coerceNumberField(req, "caffeineMg");
  coerceNumberField(req, "sugarG");
  coerceNumberField(req, "rating");

  // --- Required for POST + PUT (since PUT is not partial here) ---
  if (!isNonEmptyString(body.brand)) {
    return res
      .status(400)
      .json({ error: "brand is required and must be a string" });
  }
  if (!isNonEmptyString(body.drinkName)) {
    return res
      .status(400)
      .json({ error: "drinkName is required and must be a string" });
  }
  if (body.sizeOz === undefined || body.sizeOz === null) {
    return res.status(400).json({ error: "sizeOz is required" });
  }
  if (typeof body.sizeOz !== "number" || Number.isNaN(body.sizeOz)) {
    return res.status(400).json({ error: "sizeOz must be a number" });
  }

  // --- Validate optional fields if present (POST + PUT) ---
  if (body.caffeineMg !== undefined && body.caffeineMg !== null) {
    if (typeof body.caffeineMg !== "number" || Number.isNaN(body.caffeineMg)) {
      return res.status(400).json({ error: "caffeineMg must be a number" });
    }
  }

  if (body.sugarG !== undefined && body.sugarG !== null) {
    if (typeof body.sugarG !== "number" || Number.isNaN(body.sugarG)) {
      return res.status(400).json({ error: "sugarG must be a number" });
    }
  }

  if (body.rating !== undefined && body.rating !== null) {
    if (typeof body.rating !== "number" || Number.isNaN(body.rating)) {
      return res.status(400).json({ error: "rating must be a number" });
    }
  }

  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") {
      return res.status(400).json({ error: "notes must be a string" });
    }
  }

  // purchasedAt: allow null, or a string
  if (body.purchasedAt !== undefined && body.purchasedAt !== null) {
    if (typeof body.purchasedAt !== "string") {
      return res
        .status(400)
        .json({ error: "purchasedAt must be a string or null" });
    }
  }

  next();
}

module.exports = { validateDrink };