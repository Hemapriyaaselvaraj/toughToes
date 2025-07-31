const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/customer/home.controller'); // optional if using controller
const { isCustomerAccessible } = require('../../middlewares/auth');

router.get('', isCustomerAccessible, homeController.home);

module.exports = router;