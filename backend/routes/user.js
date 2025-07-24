const express = require('express')
const router = express.Router();
const userController = require('../controllers/user/user.controller');
const passport = require('../config/passport');
const { isNotLogin, isCustomerAccessible } = require('../middlewares/auth');

router.get('/login', isNotLogin,userController.viewLogin);
router.post('/login',userController.login);
router.get('/login/forgotPassword', isNotLogin ,userController.forgotPassword)
router.post('/login/sendOtp', userController.sendOtp)
router.post('/verifyOtp', userController.verifyOtp)
router.post('/changePassword' , userController.changePassword);


router.get('/signup',isNotLogin,userController.viewSignUp)
router.post('/signup', userController.signup)

router.get('/auth/google', isNotLogin, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', isNotLogin, (req, res, next) => {
  passport.authenticate('google', function(err, user, info) {
    if (err) {
      console.log('Authentication Error:', err);
      req.session.loginError = err.message || 'Authentication error occurred';
      return res.redirect('/user/login');
    }
    
    if (!user) {
      console.log('Authentication Info:', info);
      req.session.loginError = info.message || 'Authentication failed';
      return res.redirect('/user/login');
    }

    req.logIn(user, function(err) {
      if (err) {
        console.log('Login Error:', err);
        req.session.loginError = 'Error during login';
        return res.redirect('/user/login');
      }
      
      req.session.user = true;
      req.session.role = user.role;
      req.session.userId = user._id;
      return res.redirect('/');
    });
  })(req, res, next);
});


router.post('/logout', userController.logout);

module.exports = router