// User profile controller
const userModel = require('../../models/userModel');
const Address = require('../../models/addressModel');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    const user = await userModel.findById(req.session.userId).lean();
    if (!user) return res.redirect('/login');
    
    // Get default address
    const defaultAddress = await Address.findOne({ 
      user_id: req.session.userId,
      isDefault: true 
    }).lean();

    res.render('user/profile', {
      name: user.firstName,
      user,
      defaultAddress
    });
  } catch (err) {
    res.status(500).send('Error loading profile');
  }
};

// POST /profile (for saving changes)
exports.updateProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    const { firstName, lastName, phoneNumber } = req.body;
    await userModel.findByIdAndUpdate(req.session.userId, {
      firstName,
      lastName,
      phoneNumber
    });
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Error updating profile');
  }
};
