const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/customer/wishlist.controller');
const { isCustomerAccessible } = require('../../middlewares/auth');

router.get('/', isCustomerAccessible, wishlistController.getWishlist);
router.post('/move-to-cart', isCustomerAccessible, wishlistController.moveToCart);
router.post('/add', isCustomerAccessible, wishlistController.addToWishlist);
router.post('/remove', isCustomerAccessible, wishlistController.removeFromWishlist);

module.exports = router;
