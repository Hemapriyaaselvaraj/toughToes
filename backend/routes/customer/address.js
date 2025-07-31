const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/customer/address.controller');

// List all addresses
router.get('/', addressController.getAddresses);
// Add address
// Add address handled via AJAX/modal in addresses.ejs
router.post('/add', addressController.postAddAddress);
// Edit address
router.get('/edit/:id', addressController.getEditAddress);
router.post('/edit/:id', addressController.postEditAddress);
// Delete address
router.post('/delete/:id', addressController.deleteAddress);

// Set default address
router.post('/set-default/:id', addressController.setDefaultAddress);

module.exports = router;
