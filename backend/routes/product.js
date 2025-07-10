const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller'); // optional if using controller


router.get('/configuration', productController.getProductConfiguration)
router.post('/category', productController.createCategory)
router.put('/category/:id', productController.updateCategory)
router.delete('/category/:id', productController.deleteCategory)


module.exports = router;
