const userHelpers = require("../helpers/userHelpers");

// twilio-config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  userHome: (req, res) => {
    res.render("users/index", { user: true, userName: req.session.userName });
  },

  userLogin: (req, res) => {
    if (req.session.userLoggedIn) {
      res.redirect("/");
    } else {
      const userName = req.session.userName;
      res.render("users/login", {
        user: true,
        userName,
        passErr: req.session.passErr,
        emailErr: req.session.emailErr,
      });
      req.session.passErr = false;
      req.session.emailErr = false;
    }
  },

  userLoginPost: (req, res) => {
    userHelpers
      .doLogin(req.body)
      .then((response) => {
        if (response.status === "Invalid Password") {
          req.session.passErr = response.status;
          res.redirect("/login");
        } else if (response.status === "Invalid User") {
          req.session.emailErr = response.status;
          res.redirect("/login");
          
        }else if(response.status == "User Blocked!!!"){
            req.session.passErr = response.status;
            res.redirect("/login");
        }else {
          req.session.user = response.user;
          req.session.userName = req.session.user.name;
          req.session.userLoggedIn = true;
          res.render("users/index", {
            user: true,
            userName: req.session.userName,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  signUp: (req, res) => {
    res.render("users/signup", { user: true });
    req.session.emailExist = false;
  },

  signUpPost: (req, res) => {
    // Password check
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      res.render("users/signUp", {user: true,errMsg:"Password must contain 8 characters, uppercase, lowercase, number, and special(!@#$%^&*)"});
      return;
    }

    // Validate the mobile number using regular expressions
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(req.body.phone)) {
      res.render("users/signUp", {user: true, errmsg: "Mobile number should be 10 digit number",});
      return;
    }

    // Redirect to otp page
    const phone = req.body.phone;
    client.verify.v2
      .services("VA7ef1b38c123d6d8de4e63d54b6e2b4e6")
      .verifications.create({ to: "+91"+phone, channel: "sms" })
      .then(() => {
        req.session.userDetailes = req.body;
        res.redirect('/otpverification')
      }).catch((err) => console.log(err));
  },

//   Otp render
  otpPageRender: (req, res) => {
    res.render('users/otpVerify', {user: true});
  },


// Otp verify
  otpVerification: (req, res) => {
    const otp = req.body.otp;
    const phone = req.session.userDetailes.phone;
    console.log(req.body);
    client.verify
      .v2.services('VA7ef1b38c123d6d8de4e63d54b6e2b4e6')
      .verificationChecks.create({ to: '+91'+phone, code: otp })
      .then((verification_check) => {
        if (verification_check.status === 'approved') {

          // If the OTP is approved,Call the userSignup method to create the user
          userHelpers.doSignUp(req.session.userDetailes).then((response) => {
            if (response == "Email already exist!!!") {
              req.session.emailExist = response;
              res.render("users/signUp", {user: true, emailExist: req.session.emailExist});
            }else {
              res.redirect("/login");
            }
          })
          .catch((err) => {
            console.log(err);
          });
        } else {
          // If the OTP is not approved, render the OTP verification page with an error message
          res.render('users/otpVerify', { user:true, errMsg: 'Invalid OTP' });
        }
      })
      .catch((error) => {
        console.log(error);
        // Render the OTP verification page with an error message
        res.render('users/otpVerify', { user:true,  errMsg: 'Something went wrong. Please try again.' });
      });
  },

  
  logout: (req, res) => {
    req.session.userLoggedIn = false;
    req.session.userName = false;
    res.redirect("/login");
  },

  aboutPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/about", { user: true, userName });
  },

  cartPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/cart", { user: true, userName });
  },

  productPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/productPage", { user: true, userName });
  },

  checkOutPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/checkOut", { user: true, userName });
  },

  shopPage: (req, res) => {
    const userName = req.session.userName;
    userHelpers
      .getAllProducts()
      .then((products) => {
        res.render("users/shop", { user: true, userName, products });
      })
      .catch(() => {
        res.render("users/shop", { user: true, userName });
      });
    //res.render('users/shop', {user: true, userName});
  },

  contactPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/contact", { user: true, userName });
  },
};
