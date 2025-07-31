const Cart = require('../../models/cartModel');
const ProductVariation = require('../../models/productVariationModel');
const User = require('../../models/userModel');

const MAX_QUANTITY_PER_PRODUCT = 5; // Maximum quantity allowed per product

// Get cart items
exports.getCartPage = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/user/login');

    const user = await User.findById(req.session.userId);
    const displayName = user ? (user.firstName + ' ' + user.lastName) : '';

    const cartItems = await Cart.find({ user_id: userId })
      .populate({
        path: 'product_variation_id',
        populate: { path: 'product_id', model: 'product' }
      });
    // Prepare items for view
    const items = cartItems.map(item => {
      const v = item.product_variation_id;
      const p = v.product_id;
      let priceBefore = p && p.price ? p.price : 0;
      let priceAfter = priceBefore;
      let discount = p && p.discount_percentage ? p.discount_percentage : 0;
      if (discount > 0) {
        priceAfter = priceBefore * (1 - discount / 100);
      }
      return {
        name: p?.name || 'Product',
        size: v.product_size,
        color: v.product_color,
        image: v.images?.[0] || '/images/shoe_main.png',
        quantity: item.quantity,
        priceBefore: Math.round(priceBefore),
        priceAfter: Math.round(priceAfter),
        discount,
        total: Math.round(priceAfter * item.quantity)
      };
    });
    // Calculate summary
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const shipping = items.length ? 9.99 : 0;
    const taxPercent = 8;
    const tax = Math.round(subtotal * taxPercent / 100);
    const total = subtotal + shipping + tax;
    res.render('user/cart', {
      items,
      subtotal,
      shipping,
      tax,
      taxPercent,
      total,
      name: displayName
    });
  } catch (err) {
    console.error('Cart page error:', err);
    res.status(500).send('Error loading cart');
  }
};
// const Cart = require('../../models/cartModel');
// const ProductVariation = require('../../models/productVariationModel');

exports.addToCart = async (req, res) => {
  try {
    const { product_variation_id, quantity } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });
    if (!product_variation_id || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }
    const variation = await ProductVariation.findById(product_variation_id);
    if (!variation) return res.status(404).json({ success: false, message: 'Variation not found' });
    if (quantity > variation.stock_quantity) {
      return res.status(400).json({ success: false, message: 'Quantity exceeds stock' });
    }
    // Check if cart item exists for this user and variation
    let cartItem = await Cart.findOne({ user_id: userId, product_variation_id });
    if (cartItem) {
      // Update quantity
      cartItem.quantity += quantity;
      cartItem.updated_at = Date.now();
      await cartItem.save();
    } else {
      // Create new cart item
      await Cart.create({ user_id: userId, product_variation_id, quantity });
    }
    // Reduce stock
    variation.stock_quantity -= quantity;
    await variation.save();
    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
