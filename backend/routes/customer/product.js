const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/customer/home.controller'); // optional if using controller
const productController = require('../../controllers/customer/product.controller'); // optional if using controller
const { isCustomerAccessible } = require('../../middlewares/auth');


router.get('/', isCustomerAccessible, productController.productList);
router.get('/:id', isCustomerAccessible, productController.productDetail);
router.get('/showproducts', productController.showProducts);


module.exports = router;