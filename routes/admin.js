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


// Admin Products (Using Multer Here----)
router.get('/adminProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminProduct);

router.get('/adminAddProduct', verifySession.verifyAdminLoggedIn, adminControllers.adminAddProduct);

router.post('/adminAddProduct', multer.array('image'), adminControllers.adminAddProductPost);

router.post('/adminEditProduct/:id', multer.array('image'), adminControllers.adminEditProduct);

router.get('/adminDeleteProduct/:id', adminControllers.adminDeleteProduct);


// Admin Users
router.get('/adminUserManagement',  verifySession.verifyAdminLoggedIn, adminControllers.adminUserManagement);

router.get('/adminAddUser',  verifySession.verifyAdminLoggedIn, adminControllers.adminAddUser);

router.post('/adminAddUser', adminControllers.adminAddUserPost);

router.post('/adminEditUser/:id', adminControllers.adminEditUser);

router.get('/adminUserDelete/:id', adminControllers.adminDeleteUser);

router.get('/adminBlockUser/:id', adminControllers.adminBlockUser);


// Admin Category
router.get('/adminCategory', verifySession.verifyAdminLoggedIn, adminControllers.getCategory);

router.post('/adminCategory', adminControllers.addCategory);

router.get('/adminDeleteCategory/:id', adminControllers.deleteCategory);


// Admin Order
router.get('/adminOrder', verifySession.verifyAdminLoggedIn, adminControllers.adminOrder);

router.post('/adminOrderStatus/:id', verifySession.verifyAdminLoggedIn, adminControllers.adminOrderStatus);


module.exports = router;
