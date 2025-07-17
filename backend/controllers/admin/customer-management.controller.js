const userModel = require("../../models/userModel");

const getCustomers = async (req, res) => {
  
  const { status, search, sort, page } = req.query;
  let filter = { role: 'user' };
  if (status === 'active') filter.isBlocked = false;
  if (status === 'blocked') filter.isBlocked = true;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }
  let sortOption = { createdAt: -1 };
  if (sort === 'nameAsc') {
    sortOption = { firstName: 1, lastName: 1, createdAt: -1 };
  } else if (sort === 'nameDesc') {
    sortOption = { firstName: -1, lastName: -1, createdAt: -1 };
  }
  if (!status || status === 'all') {
    delete filter.isBlocked;
  }

  const pageSize = 5;
  const currentPage = parseInt(page) > 0 ? parseInt(page) : 1;
  const totalResults = await userModel.countDocuments(filter);
  const users = await userModel.find(filter)
    .sort(sortOption)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);

  const customers = users.map((u, idx) => ({
    name: u.firstName + ' ' + u.lastName,
    email: u.email,
    id: u._id.toString().slice(-6).toUpperCase(),
    totalOrders: u.totalOrders || 0,
    walletBalance: u.walletBalance || 0,
    status: u.isBlocked ? 'blocked' : 'active',
    isBlocked: u.isBlocked,
    _id: u._id
  }));
  const user = await userModel.findOne({ _id: req.session.userId });
  res.render("admin/customers", {
    name: user.firstName,
    customers,
    totalResults,
    currentStatus: status || 'all',
    currentSort: sort || 'nameAsc',
    currentPage,
    totalPages: Math.ceil(totalResults / pageSize)
  });
};


const blockUnblockCustomer = async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, isBlocked: user.isBlocked });
};





module.exports = {
  getCustomers,
  blockUnblockCustomer,
};
