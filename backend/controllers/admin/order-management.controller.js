const User = require('../../models/userModel'); // if needed
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
      filter._id = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    console.log('Filter:', filter);

    const totalOrders = await Order.countDocuments(filter);
    console.log('Total Orders:', totalOrders);

    const orders = await Order.find(filter)
      .populate('user_id')
      .sort({ created_at: sort === 'asc' ? 1 : -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    console.log('Orders:', orders.length);

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


// GET order detail page
exports.getOrderDetail = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('products.variation')
    .populate('returns.product')
    .populate('user_id');
  res.render('admin/orderDetail', { order, name: req.admin.name });
};

// POST cancel full order or specific product
exports.cancelOrder = async (req, res) => {
  const { productId, reason } = req.body;
  const order = await Order.findById(req.params.id).populate('products.variation');

  if (productId === 'full') {
    order.status = 'CANCELLED';
    for (let item of order.products) {
      const variation = await ProductVariation.findById(item.variation._id);
      variation.stock_quantity += item.quantity;
      await variation.save();
      item.status = 'Cancelled';
    }
  } else {
    const item = order.products.find(p => p._id.toString() === productId);
    if (item) {
      const variation = await ProductVariation.findById(item.variation);
      variation.stock_quantity += item.quantity;
      await variation.save();
      item.status = 'Cancelled';
    }
  }

  order.cancellationReason = reason || '';
  await order.save();
  res.redirect('/admin/orders/' + req.params.id);
};

// POST return a product
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

// GET download invoice as PDF
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
    doc.text(`${p.name} x ${p.quantity} - Rs. ${p.price}`);
  });

  doc.text(`\nTotal: Rs. ${order.total}`);
  doc.end();
};

// POST update order status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/admin/orders/' + req.params.id);
};

// POST verify return request
exports.verifyReturn = async (req, res) => {
  const { productId, action } = req.body;
  const order = await Order.findById(req.params.id).populate('user_id');

  const ret = order.returns.find(r => r.product.toString() === productId);
  if (ret) {
    ret.status = action === 'approve' ? 'Approved' : 'Rejected';

    if (action === 'approve') {
      order.user_id.wallet = (order.user_id.wallet || 0) + ret.refundAmount;
      await order.user_id.save();
    }
  }

  await order.save();
  res.redirect('/admin/orders/' + req.params.id);
};
