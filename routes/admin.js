const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
const multer = require('../utils/multer');
const verifySession = require('../middleware/verifySession');

// Admin Login & Logout
router.get('/', verifySession.ifAdminLoggedIn, adminControllers.adminLogin);

router.get('/AdminLogout', verifySession.verifyAdminLoggedIn, adminControllers.adminLogout);


// Admin Panel
router.get('/adminPanel', verifySession.verifyAdminLoggedIn, adminControllers.adminPanel);

router.post('/adminPanel', adminControllers.adminLoginPost);


// Admin Products 
router.get('/adminProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminProduct);

router.get('/adminAddProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminAddProduct);

router.post('/adminAddProduct', multer.array('image'), adminControllers.adminAddProductPost);

router.post('/adminEditProduct/:id', multer.array('image'), adminControllers.adminEditProduct);

router.get('/adminDeleteProduct/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminDeleteProduct);


// Admin Users
router.get('/adminUserManagement',  verifySession.verifyAdminLoggedIn, adminControllers.adminUserManagement);

router.get('/adminAddUser',  verifySession.verifyAdminLoggedIn, adminControllers.adminAddUser);

router.post('/adminAddUser', adminControllers.adminAddUserPost);

router.post('/adminEditUser/:id', adminControllers.adminEditUser);

router.get('/adminUserDelete/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminDeleteUser);

router.get('/adminBlockUser/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminBlockUser);


// Admin Category
router.get('/adminCategory', verifySession.verifyAdminLoggedIn, adminControllers.getCategory);

router.post('/adminCategory', adminControllers.addCategory);

router.get('/adminDeleteCategory/:id/:name', verifySession.verifyAdminLoggedIn, adminControllers. deleteCategory);


// Admin Order
router.get('/adminOrder', verifySession.verifyAdminLoggedIn, adminControllers.adminOrder);

router.post('/adminOrderStatus/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminOrderStatus);

router.get('/adminOrdersView/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminOrderView);

router.post('/adminRefund/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminRefund);


// Admin Sales Report
router.get('/adminSalesReport', verifySession.verifyAdminLoggedIn, adminControllers.adminSalesReport);

router.get('/adminSalesReportFilter', verifySession.verifyAdminLoggedIn, adminControllers.adminSalesReportFilter);

router.post('/adminSalesReportFilter', verifySession.verifyAdminLoggedIn, adminControllers.adminSalesReportFilterPost);


// Admin Coupon
router.get('/adminCoupon', verifySession.verifyAdminLoggedIn, adminControllers.adminCoupon);

router.post('/adminAddCoupon', verifySession.verifyAdminLoggedIn, adminControllers.adminAddCoupon);

router.post('/adminEditCoupon/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminEditCoupon);

router.get('/adminDeactivate/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminDeactivate);

router.get('/adminActivate/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminActivate);


// Admin Banner
router.get('/adminBanner', verifySession.verifyAdminLoggedIn, adminControllers.adminBanner);

router.post('/adminAddBanner', verifySession.verifyAdminLoggedIn, multer.single("image", 1), adminControllers.adminAddBanner);

router.post('/adminEditBanner/:id', verifySession.verifyAdminLoggedIn, multer.single("image", 1), adminControllers.adminEditBanner);

router.get('/adminActivateBanner/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminActivateBanner);



module.exports = router;
