const express = require('express');
const router = express.Router();
const { isCustomerAccessible } = require('../../middlewares/auth');
const walletController = require('../../controllers/customer/wallet.controller');

// GET /wallet - Show wallet page
router.get('/', isCustomerAccessible, walletController.getWallet);

module.exports = router;
