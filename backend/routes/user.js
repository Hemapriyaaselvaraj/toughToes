const express = require('express')
const router = express.Router();
const userController = require('../controllers/user/user.controller');
const passport = require('../config/passport');
const { isNotLogin, isCustomerAccessible } = require('../middlewares/auth');

router.get('/login', isNotLogin,userController.viewLogin);
router.post('/login',userController.login);
router.get('/login/forgotPassword', isNotLogin ,userController.forgotPassword)
router.post('/login/sendOtp', userController.sendOtp)
router.post('/login/verifyOtp', userController.verifyOtp)
router.post('/changePassword' , userController.changePassword);


router.get('/signup',isNotLogin,userController.viewSignUp)
router.post('/signup', userController.signup)

router.get('/auth/google', isNotLogin, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', isNotLogin, passport.authenticate('google', {
  failureRedirect: '/user/login',
}), (req, res) => {
  req.session.user = true;
  req.session.role = req.user.role;
  req.session.userId = req.user._id;
  res.redirect('/');
});


router.post('/logout', userController.logout);

module.exports = router