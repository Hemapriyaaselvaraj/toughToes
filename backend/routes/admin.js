const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller'); // optional if using controller
const customerController = require('../controllers/customer.controller'); // optional if using controller


router.get('/dashboard', adminController.getDashboard)
router.get('/customers', customerController.getCustomers);
router.post('/customers/:id/block-unblock', customerController.blockUnblockCustomer);
router.get('/customers/:id', customerController.getCustomerDetails);




module.exports = router;

