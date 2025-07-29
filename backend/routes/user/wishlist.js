const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/user/wishlist.controller');

// GET wishlist page
router.get('/', wishlistController.getWishlist);


// POST /wishlist/add
router.post('/add', wishlistController.addToWishlist);

// POST /wishlist/remove
router.post('/remove', wishlistController.removeFromWishlist);

module.exports = router;
