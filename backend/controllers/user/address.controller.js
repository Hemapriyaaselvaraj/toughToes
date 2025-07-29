const Address = require('../../models/addressModel');

// Get all addresses for the logged-in user
exports.getAddresses = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const Address = require('../../models/addressModel');
  const userModel = require('../../models/userModel');
  const addresses = await Address.find({ user_id: req.session.userId }).lean();
  const user = await userModel.findById(req.session.userId).lean();
  res.render('user/addresses', { addresses, user });
};

// Render form to add a new address
exports.getAddAddress = (req, res) => {
  // Removed: add address page is now a modal popup in addresses.ejs
};

// Handle new address submission
exports.postAddAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  await Address.create({ ...req.body, user_id: req.session.userId });
  res.redirect('/addresses');
};

// Render form to edit an address
exports.getEditAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const address = await Address.findOne({ _id: req.params.id, user_id: req.session.userId }).lean();
  if (!address) return res.redirect('/addresses');
  res.render('user/addressForm', { address, action: 'Edit' });
};

// Handle address update
exports.postEditAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  await Address.findOneAndUpdate({ _id: req.params.id, user_id: req.session.userId }, req.body);
  res.redirect('/addresses');
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  await Address.deleteOne({ _id: req.params.id, user_id: req.session.userId });
  res.redirect('/addresses');
};
