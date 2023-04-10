
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
    },

    verifyUserLoggedIn: (req, res, next) => {
        if(req.session.userLoggedIn){
            next();
        }else{
            res.redirect('/login');
        }
    },

    ifUserLoggedIn: (req, res, next) => {
        if(req.session.userLoggedIn){
            res.redirect('/');
        }else{
            next();
        }
    }




}