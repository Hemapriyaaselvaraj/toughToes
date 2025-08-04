const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/customer/wishlist.controller');


router.get('/', wishlistController.getWishlist);
router.post('/move-to-cart', wishlistController.moveToCart);
router.post('/add', wishlistController.addToWishlist);
router.post('/remove', wishlistController.removeFromWishlist);

module.exports = router;
