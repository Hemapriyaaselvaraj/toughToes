const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profile.controller');
const editProfileController = require('../../controllers/user/editProfile.controller');
// Edit profile page
router.get('/edit', editProfileController.getEditProfile);
router.post('/edit', editProfileController.postEditProfile);

// GET profile page
router.get('/', profileController.getProfile);

// POST profile update
router.post('/', profileController.updateProfile);

module.exports = router;
