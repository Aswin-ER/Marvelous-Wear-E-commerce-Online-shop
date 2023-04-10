const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const verifySession = require('../middleware/verifySession');


// User Home, Login, Signup
router.get('/', userControllers.userHome);

router.post('/', userControllers.userLoginPost);

router.get('/login', userControllers.userLogin);

router.get('/logout',verifySession.verifyUserLoggedIn, userControllers.logout);

router.get('/signUp',verifySession.ifUserLoggedIn, userControllers.signUp);

router.post('/signUp', userControllers.signUpPost);


// otp
router.get('/otpverification',verifySession.ifUserLoggedIn, userControllers.otpPageRender);

router.post('/otpverification', userControllers.otpVerification);


// User Panel
router.get('/shop',verifySession.verifyUserLoggedIn, userControllers.shopPage);

router.get('/category/:name', verifySession.verifyUserLoggedIn, userControllers.categoryFilter);

router.get('/cart',verifySession.verifyUserLoggedIn, userControllers.cartPage);

router.get('/product/:id',verifySession.verifyUserLoggedIn, userControllers.productPage);

router.get('/checkOut',verifySession.verifyUserLoggedIn, userControllers.checkOutPage);

router.get('/contact',verifySession.verifyUserLoggedIn, userControllers.contactPage);

router.get('/about',verifySession.verifyUserLoggedIn, userControllers.aboutPage);



module.exports = router;
