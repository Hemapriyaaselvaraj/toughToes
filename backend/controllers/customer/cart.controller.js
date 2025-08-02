const Cart = require('../../models/cartModel');
const ProductVariation = require('../../models/productVariationModel');
const User = require('../../models/userModel');

const MAX_QUANTITY_PER_PRODUCT = 5; // Maximum quantity allowed per product


// Update cart item quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId, action } = req.body; // action: 'increment' or 'decrement'
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });
    const cartItem = await Cart.findOne({ _id: cartItemId, user_id: userId });
    if (!cartItem) return res.status(404).json({ success: false, message: 'Cart item not found' });
    const variation = await ProductVariation.findById(cartItem.product_variation_id).populate('product_id');
    if (!variation) return res.status(404).json({ success: false, message: 'Variation not found' });
    const product = variation.product_id;
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.is_active === false) {
      return res.status(403).json({ success: false, message: 'Product is blocked or unlisted.' });
    }
    if (action === 'increment') {
      if (cartItem.quantity + 1 > variation.stock_quantity) {
        return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
      }
      cartItem.quantity += 1;
    } else if (action === 'decrement') {
      if (cartItem.quantity <= 1) {
        return res.status(400).json({ success: false, message: 'Minimum quantity is 1' });
      }
      cartItem.quantity -= 1;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    cartItem.updated_at = Date.now();
    await cartItem.save();
    res.json({ success: true, quantity: cartItem.quantity });
  } catch (err) {
    console.error('Update cart quantity error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });
    const cartItem = await Cart.findOne({ _id: cartItemId, user_id: userId });
    if (!cartItem) return res.status(404).json({ success: false, message: 'Cart item not found' });
    // No stock update here
    await Cart.deleteOne({ _id: cartItemId, user_id: userId });
    res.json({ success: true });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

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
        _id: item._id,
        name: p?.name || 'Product',
        size: v.product_size,
        color: v.product_color,
        image: v.images?.[0] || '/images/shoe_main.png',
        quantity: item.quantity,
        priceBefore: Math.round(priceBefore),
        priceAfter: Math.round(priceAfter),
        discount,
        total: Math.round(priceAfter * item.quantity),
        isActive: p.is_active,
      };
    });
    // Calculate summary
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const shipping = subtotal > 1000 ? 0 : 50;
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
    // Fetch variation and product
    const variation = await ProductVariation.findById(product_variation_id).populate('product_id');
    if (!variation) return res.status(404).json({ success: false, message: 'Variation not found' });
    const product = variation.product_id;
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.is_active === false) {
      return res.status(403).json({ success: false, message: 'Product is not available' });
    }
    if (quantity > variation.stock_quantity) {
      return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
    }
    // Check if cart item exists for this user and variation
    let cartItem = await Cart.findOne({ user_id: userId, product_variation_id });
    const MAX_QTY = 5;
    let newQty = quantity;
    if (cartItem) {
      newQty = cartItem.quantity + quantity;
      if (newQty > MAX_QTY) {
        return res.status(400).json({ success: false, message: 'You cannot add more than 5 of this product to your cart.' });
      }
      if (newQty > variation.stock_quantity) {
        return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' });
      }
      cartItem.quantity = newQty;
      cartItem.updated_at = Date.now();
      await cartItem.save();
    } else {
      if (quantity > MAX_QTY) {
        return res.status(400).json({ success: false, message: 'You cannot add more than 5 of this product to your cart.' });
      }
      await Cart.create({ user_id: userId, product_variation_id, quantity });
    }
    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Pass current cart quantity for this variation to the frontend
exports.prepareCartPageData = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const cartItems = userId ? await Cart.find({ user_id: userId }).populate('product_variation_id') : [];
    res.locals.currentCartQuantities = {};
    // For each cart item, if it has a product_variation_id, add its quantity to res.locals
    if (cartItems && cartItems.length) {
      cartItems.forEach(item => {
        if (item.product_variation_id && item.product_variation_id._id) {
          // Use a map if you want to support multiple variations on the page
          if (!res.locals.currentCartQuantities) res.locals.currentCartQuantities = {};
          res.locals.currentCartQuantities[item.product_variation_id._id] = item.quantity;
        }
      });
    }
    next();
  } catch (err) {
    console.error('Prepare cart page data error:', err);
    next();
  }
};

// For single product detail page, pass the quantity for the selected variation (if any)
exports.prepareSingleProductData = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { selectedVariationId } = req.query;
    const cartItems = userId ? await Cart.find({ user_id: userId }).populate('product_variation_id') : [];
    // Pass current cart quantity for this variation to the frontend
    let currentCartQuantity = 0;
    if (cartItems && cartItems.length) {
      cartItems.forEach(item => {
        if (item.product_variation_id && item.product_variation_id._id) {
          // Use a map if you want to support multiple variations on the page
          if (!res.locals.currentCartQuantities) res.locals.currentCartQuantities = {};
          res.locals.currentCartQuantities[item.product_variation_id._id] = item.quantity;
        }
      });
    }
    // For single product detail page, pass the quantity for the selected variation (if any)
    res.locals.currentCartQuantity = 0;
    if (cartItems && cartItems.length && typeof selectedVariationId !== 'undefined') {
      const found = cartItems.find(item => String(item.product_variation_id._id) === String(selectedVariationId));
      if (found) res.locals.currentCartQuantity = found.quantity;
    }
    next();
  } catch (err) {
    console.error('Prepare single product data error:', err);
    next();
  }
};
