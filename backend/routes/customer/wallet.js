const express = require('express');
const router = express.Router();
const { isCustomerAccessible } = require('../../middlewares/auth');
const walletController = require('../../controllers/customer/wallet.controller');

router.get('/', isCustomerAccessible, walletController.getWallet);

module.exports = router;
