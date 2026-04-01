const express = require("express");
const passport = require("../config/passport");
const {
  authSuccess,
  authFailure,
  getCurrentUser,
  logout,
} = require("../controllers/auth.controller");

const router = express.Router();

function hasGoogleOAuthConfig() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

function hasFacebookOAuthConfig() {
  return Boolean(
    process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
  );
}

router.get("/google", (req, res, next) => {
  if (!hasGoogleOAuthConfig()) {
    return res.status(500).json({
      error: "Google OAuth credentials are missing.",
    });
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!hasGoogleOAuthConfig()) {
    return res.status(500).json({
      error: "Google OAuth credentials are missing.",
    });
  }

  return passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: true,
  })(req, res, next);
}, authSuccess);

router.get("/facebook", (req, res, next) => {
  if (!hasFacebookOAuthConfig()) {
    return res.status(500).json({
      error: "Facebook OAuth credentials are missing.",
    });
  }

  return passport.authenticate("facebook", {
    scope: ["email"],
  })(req, res, next);
});

router.get("/facebook/callback", (req, res, next) => {
  if (!hasFacebookOAuthConfig()) {
    return res.status(500).json({
      error: "Facebook OAuth credentials are missing.",
    });
  }

  return passport.authenticate("facebook", {
    failureRedirect: "/auth/failure",
    session: true,
  })(req, res, next);
}, authSuccess);

router.get("/failure", authFailure);
router.get("/me", getCurrentUser);
router.post("/logout", logout);

module.exports = router;
