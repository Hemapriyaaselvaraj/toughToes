const userModel = require("../models/userModel");

const getDashboard = async (req, res) => {
  const user = await userModel.findOne({ _id: req.session.userId });
  res.render("admin/dashboard", { name: user.firstName });
};

module.exports = {
  getDashboard
};
