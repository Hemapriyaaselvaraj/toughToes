// POST /wishlist/remove
exports.removeFromWishlist = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'No product specified' });
    }
    await Wishlist.deleteOne({ user_id: req.session.userId, product_id: productId });
    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
};
// POST /wishlist/add
exports.addToWishlist = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'No product specified' });
    }
    // Check if already in wishlist
    const exists = await Wishlist.findOne({ user_id: req.session.userId, product_id: productId });
    if (exists) {
      return res.status(200).json({ success: true, message: 'Already in wishlist' });
    }
    // Add to wishlist
    await Wishlist.create({ user_id: req.session.userId, product_id: productId });
    res.status(200).json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
};


const Wishlist = require('../../models/wishlistModel');
const Product = require('../../models/productModel');
const ProductVariation = require('../../models/productVariationModel');

// GET /wishlist
exports.getWishlist = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }

    // Find all wishlist entries for this user
    const wishlistEntries = await Wishlist.find({ user_id: req.session.userId }).populate('product_id');

    // Fetch user name
    const User = require('../../models/userModel');
    const user = await User.findById(req.session.userId);
    const displayName = user ? (user.firstName + ' ' + user.lastName) : '';

    // For each wishlist product, fetch the first image from product variations
    const items = await Promise.all(wishlistEntries.map(async entry => {
      const product = entry.product_id;
      // Find a variation for this product (any color/size)
      const variation = await ProductVariation.findOne({ product_id: product._id, images: { $exists: true, $ne: [] } });
      return {
        name: product.name,
        category: product.product_category,
        price: product.price,
        image: (variation && variation.images && variation.images.length > 0) ? variation.images[0] : '/images/default-shoe.png',
        _id: product._id
      };
    }));

    res.render('user/wishlist', {
      items,
      itemCount: items.length,
      displayName
    });
  } catch (err) {
    res.status(500).send('Error loading wishlist');
  }
};
