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

// Detect Render
const isRender = !!process.env.RENDER_EXTERNAL_HOSTNAME;

// Required on Render so secure cookies + sessions work behind the proxy
app.set("trust proxy", 1);

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
 * Stores sessions in MongoDB
 */
app.use(
  session({
    name: "sid", // optional, but makes it easier to spot in devtools
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isRender, // helps express-session behave correctly behind Render
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: process.env.DB_NAME,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isRender, // MUST be true on Render (HTTPS)
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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

    const baseUrl = isRender
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : `http://localhost:${PORT}`;

    console.log(`Docs: ${baseUrl}/api-docs`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});