const Order = require('../../models/orderModel');
const User = require('../../models/userModel'); // if needed

const ITEMS_PER_PAGE = 5;

const getOrderList = async (req, res) => {
  try {
    const { page = 1, search = '', status = '', sort = 'desc' } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { orderId: new RegExp(search, 'i') },
        { 'user.name': new RegExp(search, 'i') }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user') // if you reference user in order schema
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('admin/orders', {
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / ITEMS_PER_PAGE),
      search,
      status,
      sort,
      name: req.user?.name || 'Admin'    });

  } catch (err) {
    console.error('Error loading orders:', err);
    res.status(500).send('Server error');
  }
};

module.exports = { getOrderList };