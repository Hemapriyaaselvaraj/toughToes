const Address = require('../../models/addressModel');
const userModel = require('../../models/userModel');


exports.getAddresses = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const addresses = await Address.find({ user_id: req.session.userId }).lean();
  const user = await userModel.findById(req.session.userId).lean();
  res.render('user/addresses', { addresses, user });
};

exports.postAddAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  await Address.create({ ...req.body, user_id: req.session.userId });
  res.redirect('/addresses');
};


exports.getEditAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const address = await Address.findOne({ _id: req.params.id, user_id: req.session.userId }).lean();
  if (!address) return res.redirect('/addresses');
  res.render('user/addressForm', { address, action: 'Edit' });
};


exports.postEditAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  await Address.findOneAndUpdate({ _id: req.params.id, user_id: req.session.userId }, req.body);
  res.redirect('/addresses');
};


exports.deleteAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const address = await Address.findOne({ _id: req.params.id, user_id: req.session.userId });
  const isDefault = address ? address.isDefault : false;
  
  await Address.deleteOne({ _id: req.params.id, user_id: req.session.userId });
  
  
  if (isDefault) {
    const anotherAddress = await Address.findOne({ user_id: req.session.userId });
    if (anotherAddress) {
      anotherAddress.isDefault = true;
      await anotherAddress.save();
    }
  }
  
  res.redirect('/addresses');
};


exports.setDefaultAddress = async (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  
  try {
    
    await Address.updateMany(
      { user_id: req.session.userId },
      { $set: { isDefault: false } }
    );
    
  
    await Address.findOneAndUpdate(
      { _id: req.params.id, user_id: req.session.userId },
      { $set: { isDefault: true } }
    );
    
    req.flash('success', 'Default address updated successfully');
    res.redirect('/addresses');
  } catch (error) {
    req.flash('error', 'Could not set default address');
    res.redirect('/addresses');
  }
};
