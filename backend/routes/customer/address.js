const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/customer/address.controller');
const { isCustomerAccessible } = require('../../middlewares/auth');

router.get('/', isCustomerAccessible, addressController.getAddresses);
router.post('/add', isCustomerAccessible, addressController.postAddAddress);
router.get('/edit/:id', isCustomerAccessible, addressController.getEditAddress);
router.post('/edit/:id', isCustomerAccessible, addressController.postEditAddress);
router.post('/delete/:id', isCustomerAccessible, addressController.deleteAddress);
router.post('/set-default/:id', isCustomerAccessible, addressController.setDefaultAddress);

module.exports = router;
