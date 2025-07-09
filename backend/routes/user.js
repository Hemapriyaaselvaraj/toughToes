const express = require('express')
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/login',userController.viewLogin);
router.post('/login',userController.login);

router.get('/signup',userController.viewSignUp)
router.post('/signup', userController.signup)

router.get('/login/forgotPassword',userController.forgotPassword)
router.get('/login/sendOtp',(req,res) => {
    res.render('user/otp')
})
router.get('/changePassword',(req,res) => {
    res.render('user/changePassword')
})


module.exports = router