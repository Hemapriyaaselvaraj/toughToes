const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/customer/checkout.controller');
const { isCustomerAccessible } = require('../../middlewares/auth');

router.get('/', isCustomerAccessible, checkoutController.checkout)

module.exports = router;