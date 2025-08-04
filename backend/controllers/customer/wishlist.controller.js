const Cart = require('../../models/cartModel');
const Wishlist = require('../../models/wishlistModel');
const ProductVariation = require('../../models/productVariationModel');
const User = require('../../models/userModel');

exports.moveToCart = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    const { wishlistId } = req.body;
    if (!wishlistId) {
      return res.status(400).json({ success: false, message: 'Missing wishlistId' });
    }
    
    const entry = await Wishlist.findOne({ _id: wishlistId, user_id: req.session.userId }).populate('variation_id');
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    const variation = entry.variation_id;
    if (!variation) {
      return res.status(404).json({ success: false, message: 'Product variation not found' });
    }
    
    if (variation.stock_quantity < 1) {
      return res.status(400).json({ success: false, message: 'Out of stock' });
    }
    
    let cartItem = await Cart.findOne({ user_id: req.session.userId, product_variation_id: variation._id });
    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.updated_at = Date.now();
      await cartItem.save();
    } else {
      await Cart.create({ user_id: req.session.userId, product_variation_id: variation._id, quantity: 1 });
    }
    
    variation.stock_quantity -= 1;
    await variation.save();
    
    await Wishlist.deleteOne({ _id: wishlistId, user_id: req.session.userId });
    res.status(200).json({ success: true, message: 'Moved to cart' });
  } catch (err) {
    console.error('Move to cart error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};


exports.getWishlist = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }

    
    const wishlistEntries = await Wishlist.find({ user_id: req.session.userId })
      .populate('product_id')
      .populate('variation_id');

    
    const user = await User.findById(req.session.userId);
    const displayName = user ? (user.firstName + ' ' + user.lastName) : '';

    
    const items = wishlistEntries.map(entry => ({
      name: entry.product_id.name,
      category: entry.product_id.product_category,
      price: entry.product_id.price,
      image: (entry.variation_id?.images?.length > 0) 
        ? entry.variation_id.images[0] 
        : '/images/default-shoe.png',
      _id: entry._id,
      size: entry.selected_size,
      color: entry.selected_color,
      variationId: entry.variation_id._id
    }));

    res.render('user/wishlist', {
      name: displayName,
      items: items,
      itemCount: items.length,

    });

  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).render('error', { message: 'Error loading wishlist' });
  }
};


exports.removeFromWishlist = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    const { wishlistId } = req.body;
    
    await Wishlist.deleteOne({ 
      user_id: req.session.userId, 
      _id: wishlistId,
    });
    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
};


exports.addToWishlist = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    const { productId, variationId, size, color } = req.body;
    
    
    if (!productId || !variationId || !size || !color) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Product ID, variation ID, size, and color are required.' 
      });
    }

  
    const exists = await Wishlist.findOne({ 
      user_id: req.session.userId, 
      product_id: productId,
      variation_id: variationId 
    });

    if (exists) {
      return res.status(200).json({ success: true, message: 'Already in wishlist' });
    }

    
    const variation = await ProductVariation.findById(variationId);
    if (!variation || variation.product_size !== size || variation.product_color !== color) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product variation' 
      });
    }

    
    await Wishlist.create({ 
      user_id: req.session.userId, 
      product_id: productId,
      variation_id: variationId,
      selected_size: size,
      selected_color: color
    });
    
    res.status(200).json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
};

