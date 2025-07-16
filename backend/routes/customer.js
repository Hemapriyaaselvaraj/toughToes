const express = require('express');
const router = express.Router();
const homeController = require('../controllers/customer/home.controller'); // optional if using controller
const productController = require('../controllers/customer/product.controller'); // optional if using controller
const { isCustomerAccessible } = require('../middlewares/auth');


router.get('/products', isCustomerAccessible, productController.productList);
router.get('/products/:id', isCustomerAccessible, productController.productDetail);

router.get('', isCustomerAccessible, homeController.home);

module.exports = router;