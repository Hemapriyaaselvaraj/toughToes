const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profile.controller');

// GET profile page
router.get('/', profileController.getProfile);

// POST profile update
router.post('/', profileController.updateProfile);

module.exports = router;
