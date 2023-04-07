const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

/* GET users listing. */
router.get('/', userControllers.userHome);

router.post('/', userControllers.userLoginPost);

router.get('/login', userControllers.userLogin);

router.get('/logout', userControllers.logout);

router.get('/signUp', userControllers.signUp);

router.post('/signUp', userControllers.signUpPost);

router.get('/about', userControllers.aboutPage);

router.get('/cart', userControllers.cartPage);

router.get('/product', userControllers.productPage);

router.get('/checkOut', userControllers.checkOutPage);

router.get('/shop', userControllers.shopPage);

router.get('/contact', userControllers.contactPage);

module.exports = router;
