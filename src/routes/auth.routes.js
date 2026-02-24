const { Router } = require("express");
const passport = require("passport");

const router = Router();

/**
 * GET /auth/google
 * @summary Login with Google
 * @tags Auth
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * GET /auth/google/callback
 * @summary Google OAuth callback
 * @tags Auth
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failed" }),
  (req, res) => {
    // Successful login
    res.redirect("/auth/success");
  }
);

/**
 * GET /auth/me
 * @summary Get current logged-in user
 * @tags Auth
 */
router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.status(200).json({ user: req.user });
  }
  return res.status(200).json({ user: null });
});

/**
 * POST /auth/logout
 * @summary Logout
 * @tags Auth
 */
router.post("/logout", (req, res, next) => {
  // passport logout is async in newer versions
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logged out" });
  });
});

router.get("/success", (req, res) => {
  res.status(200).send("Login successful. You can close this tab and use the API.");
});

router.get("/failed", (req, res) => {
  res.status(401).send("Login failed.");
});

module.exports = router;