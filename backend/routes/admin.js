const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/dashboard.controller');
const customerController = require('../controllers/admin/customer-management.controller');
const productController = require('../controllers/admin/product.controller');
const adminOrderController = require('../controllers/admin/order-management.controller');
const upload = require('../utils/imageUploader');
const { isAdminAccessible } = require('../middlewares/auth');


router.get('/dashboard',isAdminAccessible, adminController.getDashboard)
router.get('/customers', isAdminAccessible, customerController.getCustomers);
router.post('/customers/:id/block-unblock', customerController.blockUnblockCustomer);

router.get('/products/configuration',isAdminAccessible,  productController.getProductConfiguration)

router.get('/products/add-product',isAdminAccessible, productController.getAddProduct)
router.post('/products/add', upload.any(), productController.createProduct);
router.get('/products', isAdminAccessible, productController.getProducts);
router.post('/products/:id/toggle-active', productController.toggleActive);

router.get('/products/edit/:id', isAdminAccessible, productController.getEditProduct);
router.post('/products/edit/:id', upload.any(), productController.postEditProduct); 


router.post('/products/category', productController.createCategory)
router.put('/products/category/:id', productController.updateCategory)
router.delete('/products/category/:id', productController.deleteCategory)

router.post('/products/type', productController.createType);
router.put('/products/type/:id', productController.updateType);
router.delete('/products/type/:id', productController.deleteType);

router.post('/products/size', productController.createSize);
router.put('/products/size/:id', productController.updateSize);
router.delete('/products/size/:id', productController.deleteSize);

router.post('/products/color', productController.createColor);
router.put('/products/color/:id', productController.updateColor);
router.delete('/products/color/:id', productController.deleteColor);

router.get('/orders', adminOrderController.getOrderList);

// GET order detail page
router.get('/orders/:id', adminOrderController.getOrderDetail);

// POST cancel full order or specific product
router.post('/orders/:id/cancel', adminOrderController.cancelOrder);

// POST return a product
router.post('/orders/:id/return', adminOrderController.returnProduct);

// GET download invoice as PDF
router.get('/orders/:id/invoice', adminOrderController.downloadInvoice);

// POST change order status
router.post('/orders/:id/status', adminOrderController.updateOrderStatus);

// POST verify return request (approve or reject)
router.post('/orders/:id/return/verify', adminOrderController.verifyReturn);





module.exports = router;

