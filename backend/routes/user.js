const express = require('express')
const router = express.Router();
const userController = require('../controllers/user.controller');
const productController = require('../controllers/product.controller'); // optional if using controller
const passport = require('../config/passport');

router.get('/login',userController.viewLogin);
router.post('/login',userController.login);
router.get('/login/forgotPassword',userController.forgotPassword)
router.post('/login/sendOtp',userController.sendOtp)
router.post('/login/verifyOtp',userController.verifyOtp)
router.post('/changePassword',userController.changePassword);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/user/login',
}), (req, res) => {
  // Successful authentication
  req.session.user = true;
  req.session.role = req.user.role;
  req.session.userId = req.user._id;
  res.redirect('/');
});

router.get('/products', productController.productList);

module.exports = router