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
  // If status is not provided or is 'all', do not filter by isBlocked
  if (!status || status === 'all') {
    // Remove isBlocked filter if present
    delete filter.isBlocked;
  }

  // Pagination logic
  const pageSize = 5;
  const currentPage = parseInt(page) > 0 ? parseInt(page) : 1;
  const totalResults = await userModel.countDocuments(filter);
  const users = await userModel.find(filter)
    .sort(sortOption)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);

  // Map users to customer table format
  const customers = users.map((u, idx) => ({
    name: u.firstName + ' ' + u.lastName,
    email: u.email,
    id: u._id.toString().slice(-6).toUpperCase(), // Example: last 6 chars as ID
    totalOrders: u.totalOrders || 0, // Add this field to userModel if needed
    walletBalance: u.walletBalance || 0, // Add this field to userModel if needed
    status: u.isBlocked ? 'blocked' : 'active',
    isBlocked: u.isBlocked,
    _id: u._id
  }));
  const user = await userModel.findOne({ _id: req.session.userId });
  // For UI: pass the current status to the view
  res.render("admin/customers", {
    name: user.firstName,
    customers,
    totalResults,
    currentStatus: status || 'all', // Pass current status for UI highlighting
    currentSort: sort || 'nameAsc', // Pass current sort for UI highlighting
    currentPage,
    totalPages: Math.ceil(totalResults / pageSize)
  });
};

//how this function is working? is that only for switching?

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
