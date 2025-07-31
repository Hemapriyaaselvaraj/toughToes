const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/customer/checkout.controller');
const { checkout } = require('./profile');
const { isCustomerAccessible } = require('../../middlewares/auth');



router.get('/', isCustomerAccessible, checkoutController.checkout)
router.post('/place-order', isCustomerAccessible, checkoutController.placeOrder)

module.exports = router;