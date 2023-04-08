const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

// User Home
router.get('/', userControllers.userHome);

router.post('/', userControllers.userLoginPost);

router.get('/login', userControllers.userLogin);

router.get('/logout', userControllers.logout);

router.get('/signUp', userControllers.signUp);

router.post('/signUp', userControllers.signUpPost);

// User Panel
router.get('/shop', userControllers.shopPage);

router.get('/cart', userControllers.cartPage);

router.get('/product', userControllers.productPage);

router.get('/checkOut', userControllers.checkOutPage);

router.get('/contact', userControllers.contactPage);

router.get('/about', userControllers.aboutPage);

// otp
router.get('/otpverification', userControllers.otpPageRender);

router.post('/otpverification', userControllers.otpVerification);

module.exports = router;
