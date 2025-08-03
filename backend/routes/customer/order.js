const express = require('express');
const router = express.Router();
const { isCustomerAccessible } = require('../../middlewares/auth');
const orderController = require('../../controllers/customer/order.controller');
const invoiceController = require('../../controllers/customer/invoice.controller');


router.post('/place-order', isCustomerAccessible, orderController.placeOrder);
router.get('/order-success/:orderId', isCustomerAccessible, orderController.getOrderSuccess);
router.get('/my-orders', isCustomerAccessible, orderController.getUserOrders);
router.get('/details/:orderId', isCustomerAccessible, orderController.getOrderDetails);
router.post('/cancel/:orderId', isCustomerAccessible, orderController.cancelOrder);
router.post('/return-request', isCustomerAccessible, orderController.requestReturn);
router.get('/download-invoice/:orderId', isCustomerAccessible, invoiceController.downloadInvoice);

module.exports = router;
