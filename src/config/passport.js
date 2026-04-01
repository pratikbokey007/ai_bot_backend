const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/user.model");

function getBaseUrl() {
  return process.env.BASE_URL || "http://localhost:3000";
}

async function upsertSocialUser({
  provider,
  providerId,
  name,
  email,
  avatar,
}) {
  let user = await User.findOne({ providerId });

  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    user = await User.create({
      provider,
      providerId,
      name,
      email,
      avatar,
    });

    return user;
  }

  user.provider = provider;
  user.providerId = providerId;
  user.name = name || user.name;
  user.email = email || user.email;
  user.avatar = avatar || user.avatar;

  await user.save();

  return user;
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${getBaseUrl()}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertSocialUser({
            provider: "google",
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${getBaseUrl()}/auth/facebook/callback`,
        profileFields: ["id", "displayName", "photos", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertSocialUser({
            provider: "facebook",
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = passport;
