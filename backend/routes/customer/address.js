const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/customer/address.controller');
const { isCustomerAccessible } = require('../../middlewares/auth');

router.get('/', isCustomerAccessible, addressController.getAddresses);
router.post('/add', addressController.postAddAddress);
router.get('/edit/:id', addressController.getEditAddress);
router.post('/edit/:id', addressController.postEditAddress);
router.post('/delete/:id', addressController.deleteAddress);
router.post('/set-default/:id', addressController.setDefaultAddress);

module.exports = router;
