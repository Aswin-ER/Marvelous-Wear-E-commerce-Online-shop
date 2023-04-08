
module.exports = {
    verifyAdminLoggedIn : (req, res, next) => {
        if(req.session.adminLoggedIn){
            next()
        }else{
            res.redirect('/admin');
        }
    },

    ifAdminLoggedIn : (req, res, next) => {
        if(req.session.adminLoggedIn){
            res.redirect('/admin/adminPanel');
        }else{
            next();
        }
    }


}