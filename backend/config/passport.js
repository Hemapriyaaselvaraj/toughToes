const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/userModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/user/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await userModel.findOne({ email });
      if (user) {
        return done(null, user);
      }
      // Create new user
      user = new userModel({
        firstName: profile.name.givenName || '',
        lastName: profile.name.familyName || '',
        email,
        password: '', // No password for Google users
        phoneNumber: '', // Can be updated later
        role: 'user',
        isActive: true,
        isBlocked: false,
      });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
