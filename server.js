const express = require("express");
const cors = require("cors");
require("dotenv").config();

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const { connectToMongo } = require("./src/db/mongodb");
const router = require("./src/routes");
const { configurePassport } = require("./src/auth/passport");

const app = express();

/**
 * CORS
 * Allow credentials so session cookies work
 */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/**
 * Session configuration
 * Stores sessions in MongoDB (required for production stability)
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: process.env.DB_NAME,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: !!process.env.RENDER_EXTERNAL_HOSTNAME, // true on Render (HTTPS)
    },
  })
);

/**
 * Passport configuration
 */
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "energy-drink-log-api" });
});

/**
 * Routes
 */
app.use("/", router);

/**
 * Swagger docs
 */
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