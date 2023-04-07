const userHelpers = require('../helpers/userHelpers');

module.exports={
    userHome: (req, res)=>{
        res.render('users/index', {user:true, userName:req.session.userName});
    },

    userLogin:(req, res)=>{
        if(req.session.userLoggedIn){
            res.redirect('/')
        }else{
            const userName = req.session.userName;
            res.render('users/login', {user:true, userName, passErr:req.session.passErr, emailErr:req.session.emailErr});
            req.session.passErr = false;
            req.session.emailErr = false;
        }
    },

    userLoginPost:(req, res) => {
        userHelpers.doLogin(req.body).then((response) => {
            if(response.status === "Invalid Password"){
                req.session.passErr = response.status;
                res.redirect('/login')
            }else if(response.status === "Invalid User"){
                req.session.emailErr = response.status;
                res.redirect('/login');
            }else{
                req.session.user = response.user;
                req.session.userName = req.session.user.name;
                req.session.userLoggedIn = true;
                res.render('users/index', {user: true, userName:req.session.userName});
            }
        }).catch((err) => {
            console.log(err);
        })
    },

    signUp:(req, res) => {
        res.render('users/signup', {user:true});
        req.session.emailExist = false;
    },

    signUpPost: (req, res) => {
        userHelpers.doSignUp(req.body).then((response) => {
            if(response == "Email already exist!!!"){
                req.session.emailExist = response;
                res.render('users/signup', {user: true, emailExist:req.session.emailExist})
            }else{
                res.redirect('/login')
            }
        }).catch((err) => {
            console.log(err);
        });  
    },

    logout:(req, res) => {
        req.session.userLoggedIn = false;
        req.session.userName = false;
        res.redirect('/login');
    },

    aboutPage:(req, res)=> {
        const userName = req.session.userName;
        res.render('users/about', {user: true, userName});
    },

    cartPage:(req, res)=> {
        const userName = req.session.userName;
        res.render('users/cart', {user: true, userName});
    },

    productPage:(req, res) => {
        const userName = req.session.userName;
        res.render('users/productPage', {user: true, userName});
    },

    checkOutPage:(req, res) => {
        const userName = req.session.userName;
        res.render('users/checkOut', {user: true, userName});
    },

    shopPage:(req, res) => {
        const userName = req.session.userName;
        userHelpers.getAllProducts().then((products)=>{
            res.render('users/shop', {user: true, userName, products});
        })
        .catch(()=>{
            res.render('users/shop', {user:true, userName});
        })
        //res.render('users/shop', {user: true, userName});
    },

    contactPage:(req, res) => {
        const userName = req.session.userName;
        res.render('users/contact', {user: true, userName});
    }
}