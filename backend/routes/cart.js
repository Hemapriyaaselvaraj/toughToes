const express = require('express');
const router = express.Router();
const cartController = require('../controllers/user/cart.controller');


router.get('/', cartController.getCartPage);
router.post('/add', cartController.addToCart);

module.exports = router;
