const userModel = require('../../models/userModel');

// GET /profile/edit
exports.getEditProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    const user = await userModel.findById(req.session.userId).lean();
    if (!user) return res.redirect('/login');
    res.render('user/editProfile', { user });
  } catch (err) {
    res.status(500).send('Error loading edit profile');
  }
};

// POST /profile/edit
exports.postEditProfile = async (req, res) => {
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
