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
      // Generate random password
      const randomPassword = Math.random().toString(36).slice(-8);
      // Encrypt password before saving
      const bcrypt = require('bcrypt');
      const saltround = 10;
      const hashedPassword = await bcrypt.hash(randomPassword, saltround);
      // Set placeholder phone number
      const placeholderPhone = '0000000000';
      user = new userModel({
        firstName: profile.name.givenName || '',
        lastName: profile.name.familyName || '',
        email,
        password: hashedPassword,
        phoneNumber: placeholderPhone,
        role: 'user',
        isActive: true,
        isBlocked: false,
      });
      await user.save();

      // Send plain password to user's email
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: `Tough Toes <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your ToughToes Account Password',
        html: `<h3>Welcome to ToughToes!</h3><p>Your account was created using Google. Your password is: <b>${randomPassword}</b><br>You can use this password to login directly as well.</p>`
      });

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
