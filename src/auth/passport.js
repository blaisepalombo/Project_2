const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { findOrCreateUserFromGoogle } = require("../db/users");

function configurePassport() {
  if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");
  if (!process.env.GOOGLE_CALLBACK_URL) throw new Error("Missing GOOGLE_CALLBACK_URL");

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUserFromGoogle(profile);

          // Store minimal user info on req.user
          done(null, { id: String(user._id), displayName: user.displayName, email: user.email });
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    // user is what we passed to done(null, user)
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    // user comes from session
    done(null, user);
  });
}

module.exports = { configurePassport };