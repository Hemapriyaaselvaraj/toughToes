const requestEmailOtp = async (req, res) => {
  const { newEmail } = req.body;
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  // Check if email already exists
  const existingUser = await userModel.findOne({ email: newEmail });
  if (existingUser) {
    return res.json({ success: false, message: 'Email already registered.' });
  }
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  // Save OTP for this user and new email
  let otpVerification = await otpVerificationModel.findOne({ email: newEmail });
  if (otpVerification) {
    otpVerification.otp = otp;
    otpVerification.expiry = expiry;
    await otpVerification.save();
  } else {
    otpVerification = new otpVerificationModel({ email: newEmail, otp, expiry });
    await otpVerification.save();
  }
  // Send OTP to new email
  await transporter.sendMail({
    from: `Tough Toes <${process.env.EMAIL_USER}>`,
    to: newEmail,
    subject: 'Email Change OTP',
    html: `<h3>Your OTP for email change is: <b>${otp}</b></h3>`
  });
  // Store newEmail in session for verification
  req.session.pendingEmail = newEmail;
  res.json({ success: true });
};

const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!req.session || !req.session.userId || !req.session.pendingEmail) {
    return res.render('user/verifyOtp', { error: 'Session expired. Please try again.', email });
  }
  const otpVerification = await otpVerificationModel.findOne({ email });
  if (!otpVerification || otpVerification.otp !== otp || otpVerification.expiry < new Date()) {
    if (otpVerification && otpVerification.expiry < new Date()) {
      await otpVerification.deleteOne();
    }
    return res.render('user/verifyOtp', { error: 'Invalid or expired OTP', email });
  }
  // Update user's email
  await userModel.findByIdAndUpdate(req.session.userId, { email });
  await otpVerification.deleteOne();
  delete req.session.pendingEmail;
  res.redirect('/profile');
};
const userModel = require("../../models/userModel");
const otpVerificationModel = require("../../models/otpVerificationModel");
require('dotenv').config();

const bcrypt = require("bcrypt");
const saltround = 10;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const signup = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const user = await userModel.findOne({ email });

  if (user) {
    return res.render("user/signup", {
      error: "Email already registered, please login",
      oldInput: req.body,
    });
  }

  const hashedPassword = await bcrypt.hash(password, saltround);

  const newUser = new userModel({
    firstName,
    lastName,
    email,
    phoneNumber,
    password: hashedPassword,
  });

  await newUser.save();

  res.redirect("/user/login");
};

const viewSignUp = (req, res) => {
  res.render("user/signup", { error: null, oldInput: null });
};

const viewLogin = (req, res) => {
  res.render("user/login", { error : null});
};

const forgotPassword = (req, res) => {
  res.render("user/forgot", { error : null});
};

const sendOtp = async(req, res) => {
  const { email } = req.body;


  const user = await userModel.findOne({email});

  if(!user) {
    return res.render('user/forgot', { error: "Invalid email"})
  }

  if (user.isBlocked) {
    return res.render('user/forgot', { error: "Your account is blocked. Please contact support." })
  }


  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry =  new Date(Date.now() + 10 * 60 * 1000)

  await transporter.sendMail({
    from: `"Tough Toes" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `<h3>Your OTP is: <b>${otp}</b></h3>`
  });

  let otpVerification = await otpVerificationModel.findOne({ email });
  if (otpVerification) {
    otpVerification.otp = otp;
    otpVerification.expiry = expiry;
    await otpVerification.save();
  } else {
    otpVerification = new otpVerificationModel({
      email,
      otp,
      expiry
    });
    await otpVerification.save();
  }

  res.render('user/verifyOtp', { error: null, email});

}

const verifyOtp = async(req, res) => {
  const { email, otp } = req.body;

  const otpVerification = await otpVerificationModel.findOne({email});

  if(!otpVerification || otpVerification.otp !== otp || otpVerification.expiry < new Date()) {
    if(otpVerification.expiry < new Date()) {
      await otpVerification.deleteOne();
    }
   return res.render('user/verifyOtp', { error: "Invalid otp", email})
  }

  await otpVerification.deleteOne();

  res.render('user/changePassword', {email, error: null});

}

const changePassword = async(req, res) => {
  const { email, password, confirmPassword, otp } = req.body;
  const isAjax = req.xhr || req.headers['content-type'] === 'application/json';

  // If OTP is required, check OTP validity
  if (otp !== undefined) {
    const otpVerification = await otpVerificationModel.findOne({ email });
    if (!otpVerification || otpVerification.otp !== otp || otpVerification.expiry < new Date()) {
      if (isAjax) {
        return res.status(400).send('Invalid otp');
      } else {
        return res.render('user/verifyOtp', { error: 'Invalid otp', email });
      }
    }
    await otpVerification.deleteOne();
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    if (isAjax) return res.status(400).send('User does not exist');
    return res.render("user/changePassword", { error: "User does not exist", email });
  }

  if (password !== confirmPassword) {
    if (isAjax) return res.status(400).send('Passwords does not match');
    return res.render("user/changePassword", { error: "Passwords does not match", email });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if(isMatch) {
    if (isAjax) return res.status(400).send('New password should not be same as previous one');
    return res.render("user/changePassword", { error: "New password should not be same as previous one", email });
  }

  user.password = await bcrypt.hash(password, saltround);
  await user.save();

  if (isAjax) {
    return res.send('Password changed successfully!');
  } else {
    res.redirect('/user/login');
  }


}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) return res.render("user/login", { error: "User does not exist" });

  if (user.isBlocked) {
    return res.render("user/login", { error: "Your account is blocked. Please contact support." });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.render("user/login", { error: "Incorrrect password" });

  req.session.user = true;
  req.session.role = user.role;
  req.session.userId = user._id;

  if (user.role == "user") {
    res.redirect("/");
  } else {
    res.redirect("/admin/dashboard");
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
};

module.exports = {
  signup,
  viewSignUp,
  viewLogin,
  login,
  forgotPassword,
  sendOtp,
  verifyOtp,
  changePassword,
  logout,
  requestEmailOtp,
  verifyEmailOtp
};
