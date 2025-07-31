const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/user/checkout.controller');
const { checkout } = require('./profile');


router.get('/checkout', checkoutController.checkout)
router.post('/checkout/place-order', checkoutController.placeOrder)

module.exports = router;