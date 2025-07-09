const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller'); // optional if using controller

// Dummy data for now — replace with DB logic later
const customerData = [
  {
    _id: "1",
    name: "Priya",
    email: "priya@example.com",
    customerId: "C001",
    totalOrders: 3,
    wallet: 750.50,
    status: "Active"
  },
  {
    _id: "2",
    name: "Ravi",
    email: "ravi@example.com",
    customerId: "C002",
    totalOrders: 1,
    wallet: 100.00,
    status: "Blocked"
  }
];


// ======================= ROUTES =======================

// ✅ Admin login page
router.get('/login', (req, res) => {
  res.render('admin/login', {
    pageTitle: "Admin Login",
    adminName: "Hema"
  });
});

// ✅ Dashboard page
router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', {
    pageTitle: "Dashboard",
    adminName: "Hema"
  });
});

// ✅ Customers page
router.get('/customers', (req, res) => {
  res.render('admin/customers', {
    customers: customerData,          // Your actual customer list
    pageTitle: "Customer Management", // Will appear in <title> and heading
    adminName: "Hema",                // For navbar
    status: "",                       // Optional, empty for now
    sort: "",                         // Optional
    search: "",                       // Optional
    currentPage: 1,                   // Optional for pagination
    totalPages: 1,                    // Optional
    totalCount: customerData.length, // For showing count
    start: 0,                         // Start index (for showing pagination like "Showing 1 to 2")
    end: customerData.length          // End index
  });
});

module.exports = router;
