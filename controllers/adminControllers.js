const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const cloudinary =  require('../utils/cloudinary');

module.exports = {

    adminPanel: (req, res) => {
        res.render('admin/adminPanel', {admin: true, adminName: req.session.adminName});
    },

    adminLogin: (req, res) => {
        if(req.session.adminLoggedIn){
            res.redirect('/adminPanel')
        }else{
            const adminName = req.session.adminName;
            res.render('admin/login', {admin: true, passErr:req.session.passErr, emailErr:req.session.emailErr, adminName});
            req.session.passErr = false;
            req.session.emailErr = false;
        }
    },

    adminLoginPost: (req, res) => {
        adminHelpers.doAdminLogin(req.body).then((response) => {
            if(response.status == "Invalid password"){
                req.session.passErr = response.status;
                res.redirect('/admin');
            }else if(response.status == "Invalid user"){
                req.session.emailErr = response.status;
                res.redirect('/admin');
            }else{
                req.session.admin = response.admin;
                req.session.adminName = req.session.admin.email;
                req.session.adminLoggedIn = true;
                res.render('admin/adminPanel', {admin: true, adminName: req.session.adminName});
            }
        })
    },

    adminLogout: (req, res) => {
        req.session.adminLoggedIn = false;
        req.session.adminName = false;
        res.redirect('/admin');
    },

    adminProduct: async (req, res) => {
        const adminName = req.session.adminName;
        const productData = await productHelpers.getProducts();
        res.render('admin/adminProduct', {admin: true, adminName, productData});
    },

    adminAddProduct: (req, res) => {
        const adminName = req.session.adminName;
        res.render('admin/adminAddProduct', {admin: true, adminName});
    },

    adminAddProductPost: (req, res) => {
        productHelpers.addProducts(req.body, async(id)=>{
            const imgUrls = [];
            try{
                for(let i=0;i<req.files.length;i++){
                    const result = await cloudinary.uploader.upload(req.files[i].path);
                    imgUrls.push(result.url);
                }
                console.log(imgUrls)
                productHelpers.addProductImage(id, imgUrls).then(()=>{}).catch(()=>{});
            }catch(err){
                console.log(`error : ${err}`);
            }finally{
                res.redirect('/admin/adminAddProduct');
            }
        });
    },

    adminUserManagement: async (req, res) => {
        const adminName = req.session.adminName;
        const data = await adminHelpers.getUser();
        res.render('admin/adminUserManagement', {admin: true, adminName, data});
    },

    adminAddUser: (req, res) => {
        const adminName = req.session.adminName;
        res.render('admin/adminAddUsers', {admin: true, adminName})
    }

    
}