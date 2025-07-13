const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller'); // optional if using controller


router.get('/configuration', productController.getProductConfiguration)

router.get('/add-product', productController.getAddProduct)

// Category routes
router.post('/category', productController.createCategory)
router.put('/category/:id', productController.updateCategory)
router.delete('/category/:id', productController.deleteCategory)

// TYPE Routes
router.post('/type', productController.createType);
router.put('/type/:id', productController.updateType);
router.delete('/type/:id', productController.deleteType);

// SIZE Routes
router.post('/size', productController.createSize);
router.put('/size/:id', productController.updateSize);
router.delete('/size/:id', productController.deleteSize);

// COLOR Routes
router.post('/color', productController.createColor);
router.put('/color/:id', productController.updateColor);
router.delete('/color/:id', productController.deleteColor);

module.exports = router;
