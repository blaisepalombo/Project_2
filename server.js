const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("MONGODB_URI loaded?", !!process.env.MONGODB_URI);

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const { connectToMongo } = require("./src/db/mongodb");
const router = require("./src/routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "energy-drink-log-api" });
});

app.use("/", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

async function start() {
  await connectToMongo();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Docs: http://localhost:${PORT}/api-docs`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
