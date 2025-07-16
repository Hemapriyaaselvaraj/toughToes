const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller'); // optional if using controller
const { isCustomerAccessible } = require('../middlewares/auth');


router.get('', isCustomerAccessible, productController.productList);

module.exports = router;
