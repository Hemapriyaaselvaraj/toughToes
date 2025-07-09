const express = require('express')
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/login',userController.viewLogin);
router.post('/login',userController.login);

router.get('/signup',userController.viewSignUp)
router.post('/signup', userController.signup)

router.get('/login/forgotPassword',userController.forgotPassword)
router.post('/login/sendOtp',userController.sendOtp)
router.post('/login/verifyOtp',userController.verifyOtp)


router.get('/changePassword',userController.changePassword);


module.exports = router