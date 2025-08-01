const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/customer/cart.controller');


router.post('/update-quantity', cartController.updateCartQuantity);
router.post('/remove', cartController.removeFromCart);
router.get('/', cartController.getCartPage);
router.post('/add', cartController.addToCart);

module.exports = router;