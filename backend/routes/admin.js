const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller'); // optional if using controller


router.get('/dashboard', adminController.getDashboard)

module.exports = router;
