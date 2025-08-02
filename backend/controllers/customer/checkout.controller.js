const userModel = require('../../models/userModel');
const Product = require('../../models/productModel');
const ProductVariation = require('../../models/productVariationModel');
const Address = require('../../models/addressModel')
const Cart = require('../../models/cartModel')


const checkout = async (req, res) => {
  const userId = req.session.userId;
  const user = await userModel.findById(userId); 
  const addresses = await Address.find({ user: userId });
  const cartItems = await Cart.find({ user: userId }).populate('product');

      const displayName = user ? (user.firstName + ' ' + user.lastName) : '';

  const products = cartItems.map(item => ({
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    quantity: item.quantity
  }));

  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const discount = subtotal * 0.1; // 10% discount
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax - discount + shipping;

  res.render('user/checkout', {name: displayName, addresses, products, subtotal, tax, discount, shipping, total });
};


const placeOrder = async (req, res) => {
  const { addressId } = req.body;
  const userId = req.user._id;

  const cartItems = await Cart.find({ user: userId }).populate('product');
  const orderItems = cartItems.map(item => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price
  }));

  const order = new Order({ user: userId, address: addressId, items: orderItems, paymentMethod: 'COD' });
  await order.save();

  await Cart.deleteMany({ user: userId });

  res.json({ success: true, orderId: order._id });
};

module.exports = {
    checkout , placeOrder
}

