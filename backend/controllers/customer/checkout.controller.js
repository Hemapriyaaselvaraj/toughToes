const userModel = require('../../models/userModel');
const Product = require('../../models/productModel');
const ProductVariation = require('../../models/productVariationModel');
const Address = require('../../models/addressModel')
const Cart = require('../../models/cartModel')


const checkout = async (req, res) => {
  const userId = req.session.userId;
  const user = await userModel.findById(userId); 
  const addresses = await Address.find({ user_id: userId });
  const cartItems = await Cart.find({ user_id: userId })
    .populate({
      path: 'product_variation_id',
      populate: { path: 'product_id', model: 'product' }
    });
  const displayName = user ? (user.firstName + ' ' + user.lastName) : '';

  const products = cartItems.map(item => {
       let priceBefore = item.product_variation_id.product_id.price;
       let priceAfter = priceBefore;
      let discount = item.product_variation_id.product_id.discount_percentage || 0;
      if (discount > 0) {
        priceAfter = priceBefore * (1 - discount / 100);
      }

    return {name: item.product_variation_id.product_id.name,
    image: item.product_variation_id.images,
    price: item.product_variation_id.product_id.price,
    quantity: item.quantity,
    priceBefore,
    priceAfter,
    discount,
    }
  });

  const subtotal = products.reduce((sum, p) => sum + p.priceAfter * p.quantity, 0);
  const tax = Math.round(subtotal * 8 / 100); // 8% tax
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax  + shipping;

  res.render('user/checkout', {name: displayName, addresses, products, subtotal, tax, shipping, total });
};


const placeOrder = async (req, res) => {
  const { addressId } = req.body;
  const userId = req.user._id;

  // Get cart items with product_variation_id
  const cartItems = await Cart.find({ user: userId }).populate('product_variation_id');
  const decrementedVariations = [];
  // Try to atomically decrement stock for each item
  for (const item of cartItems) {
    const variation = item.product_variation_id;
    if (!variation) {
      // Rollback any previous decrements
      for (const rollback of decrementedVariations) {
        await ProductVariation.findByIdAndUpdate(rollback.variationId, { $inc: { stock_quantity: rollback.qty } });
      }
      return res.json({ success: false, message: 'Product variation not found.' });
    }
    const updated = await ProductVariation.findOneAndUpdate(
      { _id: variation._id, stock_quantity: { $gte: item.quantity } },
      { $inc: { stock_quantity: -item.quantity } },
      { new: true }
    );
    if (!updated) {
      // Rollback any previous decrements
      for (const rollback of decrementedVariations) {
        await ProductVariation.findByIdAndUpdate(rollback.variationId, { $inc: { stock_quantity: rollback.qty } });
      }
      return res.json({ success: false, message: `Insufficient stock for ${variation.product_id.name}` });
    }
    decrementedVariations.push({ variationId: variation._id, qty: item.quantity });
  }
  // Prepare order items
  const orderItems = cartItems.map(item => ({
    product: item.product_variation_id.product_id._id,
    quantity: item.quantity,
    price: item.product_variation_id.product_id.price
  }));
  const order = new Order({ user: userId, address: addressId, items: orderItems, paymentMethod: 'COD' });
  await order.save();
  await Cart.deleteMany({ user: userId });
  res.json({ success: true, orderId: order._id });
};

module.exports = {
    checkout , placeOrder
}

