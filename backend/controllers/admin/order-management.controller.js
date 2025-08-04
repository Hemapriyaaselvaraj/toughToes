const User = require('../../models/userModel'); 
const Order = require('../../models/orderModel');
const PDFDocument = require('pdfkit');
const ProductVariation = require('../../models/productVariationModel');

const ITEMS_PER_PAGE = 5;

exports.getOrderList = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).send('Unauthorized');

    const { page = 1, search = '', status = '', sort = 'desc' } = req.query;
    const filter = {};

    if (search) {
      filter.order_number = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const totalOrders = await Order.countDocuments(filter);

    let orders = await Order.find(filter)
      .populate('user_id')
      .sort({ ordered_at: sort === 'asc' ? 1 : -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    orders = orders.map(order => {
      order.total = Math.round(order.total);
      order.subtotal = Math.round(order.subtotal);

      return order;
    });


    res.render('admin/orders', {
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / ITEMS_PER_PAGE),
      search,
      status,
      sort,
      name: user.firstName,
    });

  } catch (err) {
    console.error('Error loading orders:', err);
    res.status(500).send('Server error: ' + err.message);
  }
};

exports.getOrderDetail = async (req, res) => {
  const user = await User.findById(req.session.userId);
  const displayName = user ? user.firstName + " " + user.lastName : "";
  
  const order = await Order.findById(req.params.id)
    .populate('products.variation')
    .populate('returns.product')
    .populate('user_id');

  res.render('admin/order-details', { order, name: displayName });
};

exports.cancelOrder = async (req, res) => {
  const { productId, reason } = req.body;
  const order = await Order.findById(req.params.id).populate('products.variation');

  if (productId === 'full') {
    order.status = 'CANCELLED';
    for (let item of order.products) {
      const variation = await ProductVariation.findById(item.variation._id);
      variation.stock_quantity += item.quantity;
      await variation.save();
      item.status = 'CANCELLED';
    }
  } else {
    const item = order.products.find(p => p._id.toString() === productId);
    if (item) {
      const variation = await ProductVariation.findById(item.variation);
      variation.stock_quantity += item.quantity;
      await variation.save();
      item.status = 'CANCELLED';
    }
  }

  order.cancellationReason = reason || '';
  await order.save();
  res.redirect('/admin/orders/' + req.params.id);
};

exports.returnProduct = async (req, res) => {
  const { productId, reason } = req.body;
  if (!reason) return res.redirect('/admin/orders/' + req.params.id);

  const order = await Order.findById(req.params.id);
  const productItem = order.products.find(p => p.variation.toString() === productId);

  if (productItem) {
    order.returns.push({
      product: productId,
      reason,
      status: 'Requested',
      refundAmount: productItem.price * productItem.quantity
    });
    await order.save();
  }

  res.redirect('/admin/orders/' + req.params.id);
};


exports.downloadInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('products.variation')
    .populate('user_id');

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
  doc.pipe(res);

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.text(`\nOrder ID: ${order._id}`);
  doc.text(`Date: ${order.ordered_at.toDateString()}`);
  doc.text(`Customer: ${order.user_id.firstName} ${order.user_id.lastName}`);

  doc.moveDown();
  order.products.forEach(p => {
    doc.text(`${p.name} x ${p.quantity} - ₹ ${p.price}`);
  });

  doc.text(`\nTotal: ₹ ${order.total}`);
  doc.end();
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    
    await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: status,
          'products.$[].status': status 
        }
      },
      { new: true } 
    );

    res.redirect('/admin/orders/' + orderId);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};


exports.verifyReturn = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('user_id')
      .populate('products.variation');

    if (!order) {
      throw new Error('Order not found');
    }

    
    const product = order.products.id(productId);
    if (!product) {
      throw new Error('Product not found in order');
    }

    if (action === 'approve') {
      
      product.status = 'RETURNED';
      product.return_details.status = 'APPROVED';

      
      order.user_id.wallet = (order.user_id.wallet || 0) + product.return_details.refundAmount;
      await order.user_id.save();

    
      await ProductVariation.findByIdAndUpdate(
        product.variation._id,
        { $inc: { stock_quantity: product.quantity } }
      );

      
      const allProductsReturned = order.products.every(p => p.status === 'RETURNED');
      if (allProductsReturned) {
        order.status = 'RETURNED';
      }
    } else if (action === 'reject') {
      
      product.status = 'DELIVERED';
      product.return_details.status = 'REJECTED';
    }

    await order.save();

    req.flash('success', `Return request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    res.redirect('/admin/orders/' + orderId);
  } catch (error) {
    console.error('Error processing return request:', error);
    req.flash('error', error.message || 'Failed to process return request');
    res.redirect('/admin/orders/' + req.params.id);
  }
};
