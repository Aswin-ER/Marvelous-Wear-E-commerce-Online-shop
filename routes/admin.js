const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
const upload = require('../utils/multer');

/* GET home page. */
router.get('/', adminControllers.adminLogin);

router.get('/adminPanel', adminControllers.adminPanel);

router.post('/adminPanel', adminControllers.adminLoginPost);

router.get('/AdminLogout', adminControllers.adminLogout);

router.get('/adminProduct', adminControllers.adminProduct);

router.get('/adminAddProduct', adminControllers.adminAddProduct);

router.post('/adminAddProduct',upload.array('image'), adminControllers.adminAddProductPost);

router.get('/adminUserManagement', adminControllers.adminUserManagement);

router.get('/adminAddUser', adminControllers.adminAddUser);



module.exports = router;
