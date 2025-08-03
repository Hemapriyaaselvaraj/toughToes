const express = require('express');
const router = express.Router();
const { isCustomerAccessible } = require('../../middlewares/auth');
const orderController = require('../../controllers/customer/order.controller');

router.post('/place-order', isCustomerAccessible, orderController.placeOrder);
router.get('/order-success/:orderId', isCustomerAccessible, orderController.getOrderSuccess);
router.get('/my-orders', isCustomerAccessible, orderController.getUserOrders);

module.exports = router;
