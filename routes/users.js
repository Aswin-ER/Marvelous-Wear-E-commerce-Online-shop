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


// User Panel shop page
router.get('/shop',verifySession.verifyUserLoggedIn, userControllers.shopPage);

router.get('/product/:id',verifySession.verifyUserLoggedIn, userControllers.productPage);

router.get('/category/:name', verifySession.verifyUserLoggedIn, userControllers.categoryFilter);


// User Cart
router.get('/cart/',verifySession.verifyUserLoggedIn, userControllers.cart);

router.get('/addToCart/:id', verifySession.verifyUserLoggedIn, userControllers.cartPage);

router.get('/deleteCart/:id', verifySession.verifyUserLoggedIn, userControllers.deleteCart);

router.post('/change-product-quantity', verifySession.verifyUserLoggedIn, userControllers.changeProductQuantity);



// User Checkout
router.get('/checkOut',verifySession.verifyUserLoggedIn, userControllers.checkOutPage);

router.post('/checkOutPost', verifySession.verifyUserLoggedIn, userControllers.checkOutPost);

router.post('/editAddressPost/:id', verifySession.verifyUserLoggedIn, userControllers.editAddressPost);

router.get('/deleteAddress/:id' , verifySession.verifyUserLoggedIn, userControllers.deleteAddress);

//Not using this code due to the error
// router.get('/changeActiveAddress/:id', verifySession.verifyUserLoggedIn, userControllers.changeActiveAddress);

router.post('/placeOrder', verifySession.verifyUserLoggedIn, userControllers.placeOrder);


// User  Orders
router.get('/orders', verifySession.verifyUserLoggedIn, userControllers.orders);

router.get('/cancelOrder/:id', verifySession.verifyUserLoggedIn, userControllers.cancelOrder);

router.get('/orders/viewProduct/:id', verifySession.verifyUserLoggedIn, userControllers.viewDet);


// Contact Page
router.get('/contact',verifySession.verifyUserLoggedIn, userControllers.contactPage);


//About Page
router.get('/about',verifySession.verifyUserLoggedIn, userControllers.aboutPage);


//UserProfile
router.get('/userProfile', verifySession.verifyUserLoggedIn, userControllers.userProfile);

router.post('/userProfilePost', verifySession.verifyUserLoggedIn, userControllers.userProfilePost);

router.get('/userManageAddress', verifySession.verifyUserLoggedIn, userControllers.manageAddress);





module.exports = router;
