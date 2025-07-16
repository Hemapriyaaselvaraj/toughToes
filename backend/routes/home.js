const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const { isCustomerAccessible } = require('../middlewares/auth');

router.get('', isCustomerAccessible, homeController.home);

module.exports = router;