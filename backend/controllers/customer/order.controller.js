const userModel = require("../../models/userModel");
const Product = require("../../models/productModel");
const ProductVariation = require("../../models/productVariationModel");
const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModel");
const Order = require("../../models/orderModel");
const mongoose = require('mongoose');
const { generateOrderNumber } = require('../../utils/orderNumberGenerator');

// Get all orders for a user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await userModel.findById(userId);
        
        const orders = await Order.find({ user_id: userId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate({
                path: 'products.variation',
                populate: {
                    path: 'product_id',
                    select: 'name price'
                }
            })
            .lean();

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.order_number,
            status: order.status,
            createdAt: order.createdAt,
            totalAmount: Math.round(order.total),
            items: order.products.map(item => ({
                name: item.name,
                image: item.images[0],
                price: Math.round(item.price),
                quantity: item.quantity,
                size: item.size,
                color: item.color
            }))
        }));

        res.render('user/orders', {
            orders: formattedOrders,
            user: user
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};


const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod = 'COD' } = req.body;
    const userId = req.session.userId;

    // Get cart items with all necessary product information
    const cartItems = await Cart.find({ user_id: userId })
      .populate({
        path: 'product_variation_id',
        populate: { 
          path: 'product_id',
          select: 'name price discount_percentage is_active'
        }
      });

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Get shipping address
    const address = await Address.findById(addressId);
    if (!address) {
      throw new Error('Shipping address not found');
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const orderProducts = [];
    const stockUpdates = [];
    const unavailableItems = [];

    for (const item of cartItems) {
      const variation = item.product_variation_id;
      const product = variation.product_id;

      // Skip inactive products or out of stock items
      if (!product.is_active) {
        unavailableItems.push({
          name: product.name,
          reason: 'Product is no longer available'
        });
        continue;
      }

      // Skip if insufficient stock
      if (variation.stock_quantity < item.quantity) {
        unavailableItems.push({
          name: product.name,
          reason: `Only ${variation.stock_quantity} units available`
        });
        continue;
      }

      // Calculate prices
      const original_price = product.price;
      const discount_percentage = product.discount_percentage || 0;
      const price = original_price * (1 - discount_percentage / 100);
      
      subtotal += price * item.quantity;

      // Prepare order product
      orderProducts.push({
        variation: variation._id,
        name: product.name,
        quantity: item.quantity,
        price: price,
        original_price: original_price,
        discount_percentage: discount_percentage,
        color: variation.product_color,
        size: variation.product_size,
        images: variation.images,
        status: 'ORDERED'
      });

      // Prepare stock update
      stockUpdates.push({
        updateOne: {
          filter: { _id: variation._id },
          update: { $inc: { stock_quantity: -item.quantity } }
        }
      });
    }

    const shipping_charge = subtotal > 1000 ? 0 : 50;
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + shipping_charge + tax;

    // Create order
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3 days delivery estimate

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Convert pincode to string if it's a number
    const shippingAddress = {
      name: address.name,
      label: address.label,
      type: address.type || 'HOME',
      house_number: address.house_number,
      street: address.street || '',
      locality: address.locality,
      city: address.city,
      state: address.state,
      pincode: address.pincode.toString(),
      phone_number: address.phone_number
    };

    const order = new Order({
      order_number: orderNumber,
      user_id: userId,
      products: orderProducts,
      status: 'ORDERED',
      total: total,
      subtotal: subtotal,
      tax: tax,
      shipping_charge: shipping_charge,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      estimated_delivery_date: estimatedDelivery
    });

    // Check if there are any products to order
    if (orderProducts.length === 0) {
      throw new Error('No available products to order. ' + 
        unavailableItems.map(item => `${item.name}: ${item.reason}`).join(', '));
    }

    // Save the order first
    const savedOrder = await order.save();
    
    // Update product variations stock
    try {
      await ProductVariation.bulkWrite(stockUpdates);
    } catch (error) {
      // If stock update fails, delete the order and throw error
      await Order.findByIdAndDelete(savedOrder._id);
      throw new Error('Failed to update product stock. Please try again.');
    }
    
    // Clear the cart after successful order
    await Cart.deleteMany({ user_id: userId });

    // Return success response with order details
    res.status(200).json({
      success: true,
      orderId: savedOrder._id,
      orderNumber: savedOrder.order_number,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to place order' 
    });
  }
};

const getOrderSuccess = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.session.userId;

    // Find order and ensure it belongs to the current user
    const order = await Order.findOne({
      _id: orderId,
      user_id: userId
    }).populate({
      path: 'products.variation',
      populate: {
        path: 'product_id',
        select: 'name images'
      }
    });

    if (!order) {
      return res.redirect('/');
    }

    const user = await userModel.findById(userId);
    const displayName = user ? user.firstName + " " + user.lastName : "";

    // Format the data for the template
    const orderData = {
      _id: order._id,
      orderNumber: order.order_number,
      items: order.products.map(item => ({
        product: {
          name: item.name,
          images: item.images
        },
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: order.subtotal,
      shipping: order.shipping_charge,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shipping_address,
      paymentDetails: {
        method: order.payment_method,
        status: order.payment_status,
        last4: '1234' // You would get this from your payment processor
      },
      estimatedDelivery: order.estimated_delivery_date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    };


    res.render('user/orderSuccess', { 
      order: orderData,
      name: displayName
    });
  } catch (error) {
    console.error('Error in getOrderSuccess:', error);
    res.redirect('/');
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.session.userId;

    const order = await Order.findOne({
      _id: orderId,
      user_id: userId
    }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const user = await userModel.findById(userId);

    // Format the order data for the template
    const formattedOrder = {
      _id: order._id,
      orderNumber: order.order_number,
      status: order.status,
      createdAt: order.createdAt,
      estimatedDelivery: order.estimated_delivery_date,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      items: order.products.map(item => ({
        _id: item._id,
        name: item.name,
        image: item.images[0],
        price: Math.round(item.price),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        status: item.status || order.status, // Use order status if item status is not set
        return_details: item.return_details
      })),
      subtotal: Math.round(order.subtotal),
      shipping_charge: order.shipping_charge,
      tax: Math.round(order.tax),
      total: Math.round(order.total)
    };


    res.render('user/orderDetails', {
      order: formattedOrder,
      user: user
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.session.userId;

    const order = await Order.findOne({
      _id: orderId,
      user_id: userId
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled in its current status' 
      });
    }

    // Update order status and all products status
    order.status = 'CANCELLED';
    
    // Update status for all products in the order
    order.products.forEach(item => {
      item.status = 'CANCELLED';
    });

    // Return items to inventory
    const stockUpdates = order.products.map(item => ({
      updateOne: {
        filter: { _id: item.variation },
        update: { $inc: { stock_quantity: item.quantity } }
      }
    }));

    await ProductVariation.bulkWrite(stockUpdates);
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

const requestReturn = async (req, res) => {
  try {
    const { orderId, itemId, reason, comments } = req.body;
    const userId = req.session.userId;

    const order = await Order.findOne({
      _id: orderId,
      user_id: userId
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Return can only be requested for delivered orders' 
      });
    }

    // Find the specific item in the order
    const item = order.products.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in order' });
    }

    if (item.status === 'RETURN_REQUESTED' || item.status === 'RETURNED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Return already requested or processed for this item' 
      });
    }

    // Update item status and add return details
    item.status = 'RETURN_REQUESTED';
    item.return_details = {
      reason: reason,
      comments: comments,
      requested_at: new Date(),
      status: 'PENDING',
      refundAmount: item.price * item.quantity
    };

    await order.save();

    res.json({ success: true, message: 'Return request submitted successfully' });
  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(500).json({ success: false, message: 'Failed to request return' });
  }
};

module.exports = {
    placeOrder,
    getUserOrders,
    getOrderSuccess,
    getOrderDetails,
    cancelOrder,
    requestReturn
};