const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller'); // optional if using controller
const customerController = require('../controllers/customer.controller'); // optional if using controller
const productController = require('../controllers/product.controller'); // optional if using controller
const upload = require('../utils/imageUploader');


router.get('/dashboard', adminController.getDashboard)
router.get('/customers', customerController.getCustomers);
router.post('/customers/:id/block-unblock', customerController.blockUnblockCustomer);
router.get('/customers/:id', customerController.getCustomerDetails);

router.get('/products/configuration', productController.getProductConfiguration)

router.get('/products/add-product', productController.getAddProduct)
router.post('/products/add', upload.any(), productController.createProduct);
router.get('/products', productController.getProducts);
router.post('/:id/toggle-active', productController.toggleActive);

router.get('/products/edit/:id', productController.getEditProduct);
router.post('/products/edit/:id', upload.any(), productController.postEditProduct);

// Product detail route
router.get('/products/detail/:id', productController.productDetail);

// Category routes
router.post('/products/category', productController.createCategory)
router.put('/products/category/:id', productController.updateCategory)
router.delete('/products/category/:id', productController.deleteCategory)

// TYPE Routes
router.post('/products/type', productController.createType);
router.put('/products/type/:id', productController.updateType);
router.delete('/products/type/:id', productController.deleteType);

// SIZE Routes
router.post('/products/size', productController.createSize);
router.put('/products/size/:id', productController.updateSize);
router.delete('/products/size/:id', productController.deleteSize);

// COLOR Routes
router.post('/products/color', productController.createColor);
router.put('/products/color/:id', productController.updateColor);
router.delete('/products/color/:id', productController.deleteColor);


module.exports = router;

