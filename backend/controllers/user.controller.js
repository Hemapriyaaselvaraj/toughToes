const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltround = 10;

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



const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) return res.render("user/login", { error: "User does not exist" });

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

module.exports = { signup, viewSignUp, viewLogin, login, forgotPassword };
