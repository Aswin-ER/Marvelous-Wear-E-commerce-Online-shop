
const { forEach } = require("jszip");
const cartHelpers = require("../helpers/cartHelpers");
const categoryHelpers = require("../helpers/categoryHelpers");
const productHelpers = require("../helpers/productHelpers");
const userHelpers = require("../helpers/userHelpers");
const paypal = require('paypal-rest-sdk');
const cloudinary = require('../utils/cloudinary');
const objectId = require('mongodb-legacy').ObjectId;

// Twilio-configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);


//Paypal-configuration
const paypal_client_id = process.env.PAYPAL_CLIENT_ID;
const paypal_client_secret = process.env.PAYPAL_CLIENT_SECRET;

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': paypal_client_id,
  'client_secret': paypal_client_secret
});


module.exports = {


  //User Home
  userHome: (req, res) => {
    productHelpers.getSomeProducts().then(async (products) => {
      const coupons = await userHelpers.getCoupon()
      coupons.forEach(coupon => {
        coupon.deactivate = coupon.status === 'Deactivated' ? true : false;
        coupon.expired = coupon.status === 'Expired' ? true : false;
      })
      const banner = await userHelpers.getActiveBanner()
      res.render("users/index", {
        user: true,
        userName: req.session.userName,
        products,
        banner,
        coupons
      });
    });
  },


  //User Login & Logout
  userLogin: async (req, res) => {
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
    try {
      userHelpers.doLogin(req.body)
        .then((response) => {
          if (response.status === "Invalid Password") {
            req.session.passErr = response.status;
            res.redirect("/login");
          } else if (response.status === "Invalid User") {
            req.session.emailErr = response.status;
            res.redirect("/login");
          } else if (response.status === "User Blocked!!!") {
            req.session.passErr = response.status;
            res.redirect("/login");
          } else {
            req.session.user = response.user;
            // console.log(JSON.stringify(response)+"hehehehe")
            req.session.userName = req.session.user.name;
            req.session.userLoggedIn = true;
            productHelpers.getSomeProducts().then(async (products) => {
              const coupons = await userHelpers.getCoupon()
              coupons.forEach(coupon => {
                coupon.deactivate = coupon.status === 'Deactivated' ? true : false;
                coupon.expired = coupon.status === 'Expired' ? true : false;
              })
              const banner = await userHelpers.getActiveBanner();
              res.render("users/index", {
                user: true,
                userName: req.session.userName,
                products,
                banner,
                coupons
              });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  },

  logout: (req, res) => {
    req.session.userLoggedIn = false;
    req.session.userName = false;
    res.redirect("/login");
  },


  //User Signup
  signUp: (req, res) => {
    res.render("users/signUp", { user: true });
    req.session.emailExist = false;
  },

  signUpPost: (req, res) => {
    try {
      // Password check
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(req.body.password)) {
        res.render("users/signUp", {
          user: true,
          errMsg: "Password must contain 8 characters, uppercase, lowercase, number, and special(!@#$%^&*)",
        });
        return;
      }

      if (req.body.password !== req.body.password2) {
        res.render("users/signUp", {
          user: true,
          erroreMsg: "Password doesn't match entered above!!!",
        });
        return;
      }

      // Validate the mobile number using regular expressions
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(req.body.phone)) {
        res.render("users/signUp", {
          user: true, errmsg: "Mobile number should be 10 digit number",
        });
        return;
      }

      // Redirect to otp page
      const phone = req.body.phone;
      client.verify.v2.services("VA7ef1b38c123d6d8de4e63d54b6e2b4e6")
        .verifications.create({ to: "+91" + phone, channel: "sms" }).then(() => {
          req.session.userDetailes = req.body;
          res.render("users/otpVerify", { user: true, phone });
        }).catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  },

  otpVerification: (req, res) => {
    try {
      const otp = req.body.otp;
      const phone = req.session.userDetailes.phone;
      console.log(req.body);
      client.verify.v2
        .services("VA7ef1b38c123d6d8de4e63d54b6e2b4e6")
        .verificationChecks.create({ to: "+91" + phone, code: otp })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
            // If the OTP is approved,Call the userSignup method to create the user
            userHelpers.doSignUp(req.session.userDetailes)
              .then((response) => {
                if (response == "Email already exist!!!") {
                  req.session.emailExist = response;
                  res.render("users/signUp", {
                    user: true,
                    emailExist: req.session.emailExist,
                  });
                } else {
                  res.redirect("/login");
                }
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            // If the OTP is not approved, render the OTP verification page with an error message
            res.render("users/otpVerify", {
              user: true,
              errMsg: "Invalid OTP",
            });
          }
        })
        .catch((error) => {
          console.log(error);

          // Render the OTP verification page with an error message
          res.render("users/otpVerify", {
            user: true,
            errMsg: "Something went wrong. Please try again.",
          });
        });
    } catch (err) {
      console.log(err);
    }
  },

  forgotPassword: (req, res) => {
    res.render('users/forgot', { user: true, loginError: req.session.loginError })
    req.session.loginError = false;
  },

  forgotPasswordPost: (req, res) => {
    let mobile = req.body.phone;
    userHelpers.doLoginWithMobile(mobile).then((response) => {
      if (response.status) {
        req.session.user = response.user;
        req.session.userName = req.session.user.name;
        client.verify.v2.services('VA7ef1b38c123d6d8de4e63d54b6e2b4e6')
          .verifications
          .create({ to: `+91${mobile}`, channel: 'sms' })
          .then(verification => {
            console.log(verification.status);
            res.render('users/forgotPasswordVerify', { user: true, mobile });
          })
          .catch(error => console.error(error));
      } else {
        req.session.loginError = "Mobile Number is not registered"
        res.redirect('/forgotPassword')
      }
    })
  },

  forgotPasswordVerify: (req, res) => {
    let otp = req.body.otp;
    let mobile = req.body.phone;

    try {
      client.verify.v2.services('VA7ef1b38c123d6d8de4e63d54b6e2b4e6')
        .verificationChecks
        .create({ to: `+91${mobile}`, code: otp })
        .then(verification_check => {
          console.log(verification_check.status);
          if (verification_check.valid) {
            req.session.userLoggedIn = true;
            res.render('users/setNewPassword', { user: true, mobile });
          } else {
            res.render('users/forgotPasswordVerify', { user: true, mobile, status: true });
          }
        })
    } catch (err) {
      console.log(err);
      res.render('users/forgotPasswordVerify', { user: true, mobile, status: true });
    }
  },

  setNewPassword: (req, res) => {
    userHelpers.setNewPassword(req.body).then(() => {
      res.redirect('/');
    });
  },


  //About Page
  aboutPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/about", { user: true, userName });
  },


  //User Cart Page
  cart: async (req, res) => {
    const userName = req.session.user.name;
    const userId = req.session.user._id;
    const userDetailes = await cartHelpers.getCart(userId);
    if (!userDetailes.length == 0) {
      await cartHelpers.getCartTotal(req.session.user._id).then((total) => {
        res.render("users/cart", {
          user: true,
          userName,
          userDetailes,
          total: total,
        });
      });
    } else {
      res.render("users/cart", { user: true, userName });
    }
  },

  cartPage: async (req, res) => {
    const productId = req.params.id;
    let quantity = 1;
    await cartHelpers.addToCart(productId, req.session.user._id, quantity);
    res.json({
      status: "success",
      message: "added to cart",
    });
  },

  deleteCart: (req, res) => {
    const userId = req.session.user._id;
    const productId = req.params.id;
    cartHelpers.deleteCart(productId, userId).then(() => {
      res.json({
        status: "success",
        message: "Product deleted from cart",
      });
      // res.redirect('back');
    });
  },


  //User Product Page
  productPage: async (req, res) => {
    const productData = req.params.id;
    const userName = req.session.userName;
    productHelpers
      .getSingleProduct(productData)
      .then(async (product) => {
        console.log(product + "category");
        const getRelatedProduct = await productHelpers.getRelatedProducts(
          product.category
        );
        res.render("users/productPages", {
          user: true,
          userName,
          product,
          getRelatedProduct,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },


  // User Checkout Page
  checkOutPage: async (req, res) => {
    const userName = req.session.user.name;
    const addresses = await userHelpers.getAddress(req.session.user._id);
    const coupons = await userHelpers.getCoupon();
    coupons.forEach(coupon => {
      coupon.deactivate = coupon.status === 'Deactivated' ? true : false;
      coupon.expired = coupon.status === 'Expired' ? true : false;
    });
    await cartHelpers.getCartTotal(req.session.user._id)
      .then((total) => {
        res.render("users/checkOut", {
          user: true,
          userName,
          addresses,
          total,
          coupons
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  checkOutPost: (req, res) => {
    try {
      userHelpers.addAddress(req.body, req.session.user._id);
      res.redirect("back");
    } catch (err) {
      console.log(err);
    }
  },

  placeOrder: async (req, res) => {
    try {
      const addressId = req.body.address;
      const userDetails = req.session.user;
      const total = Number(req.body.total);
      const paymentMethod = req.body.paymentMethod;
      const shippingAddress = await userHelpers.findAddress(addressId, req.session.user._id);
      const cartItems = await cartHelpers.getCart(req.session.user._id);
      const now = new Date();
      const status = req.body.paymentMethod === "COD" ? "placed" : "pending";

      //Order collection
      const order = {
        userId: new objectId(req.session.user._id),
        userName: req.session.userName,
        item: cartItems,
        shippingAddress: shippingAddress,
        total: total,
        paymentMethod: paymentMethod,
        products: cartItems,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
        status,
        coupon: req.body.coupon,
      };

      const userId = req.session.user._id;
      userHelpers.addOrderDetails(order, userId)
        .then((order) => {
          cartHelpers.deleteCartFull(req.session.user._id);

          if (req.body.paymentMethod === "COD") {
            res.json({
              status: true,
              paymentMethod: req.body.paymentMethod,
            });

          } else if (req.body.paymentMethod === "card") {

            const orderId = order.insertedId;

            userHelpers.generateRazorpay(orderId, total).then((response) => {
              res.json({
                response: response,
                paymentMethod: "card",
                userDetails: userDetails,
              });
            });
          } else {

            const exchangeRate = 0.013;
            const totalCost = (Number(req.body.total) * exchangeRate).toFixed(0);
            const create_payment_json = {
              intent: "sale",
              payer: {
                payment_method: "paypal",
              },
              redirect_urls: {
                return_url: "http://localhost:3000/success",
                cancel_url: "http://localhost:3000/cancel",
              },
              transactions: [
                {
                  amount: {
                    currency: "USD",
                    total: `${totalCost}`,
                  },
                  description: "Marvelous Ware SHOPPING PLATFORM PAYPAL PAYMENT",
                },
              ],
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
              if (error) {
                console.log(error + "asasasasas");
                res.render('users/failure', { user: true, userName: req.session.userName });

              } else if (payment) {
                try {
                  req.session.orderId = order.insertedId;
                  userHelpers.changeOrderStatus(order.insertedId).then(() => { console.log("changed") }).catch(() => { });
                  // productHelpers.reduceStock(cartList).then(()=>{}).catch((err)=>console.log(err));
                } catch (err) {
                  console.log(err);
                } finally {
                  for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === "approval_url") {
                      res.json({
                        approval_link: payment.links[i].href,
                        status: "success"
                      })
                    }
                  }
                }
              }
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  },

  editAddressPost: (req, res) => {
    try {
      const address = req.params.id;
      userHelpers.editAddress(req.body, req.session.user._id, address);
      res.redirect("back");
    } catch (err) {
      console.log(err);
    }
  },

  deleteAddress: (req, res) => {
    const addressId = req.params.id;
    userHelpers.deleteAddress(addressId, req.session.user._id);
    res.redirect("back");
  },


  //User Shop page
  shopPage: async (req, res) => {
    const userName = req.session.userName;
    const filteredProducts = req.session.filteredProduct;
    const minPrice = req.session.minPrice;
    const maxPrice = req.session.maxPrice;
    const sortedProducts = req.session.sortedProduct;
    const categories = await productHelpers.getListedCategory();

    //pagination
    const totalPages = await productHelpers.totalPages();
    const currentPage = req.query.page || 1;

    if (filteredProducts) {
      res.render("users/shop", { user: true, categories, userName, filteredProducts, minPrice, maxPrice });
      req.session.filteredProduct = false;
      req.session.maxPrice = false;
      req.session.minPrice = false;
    } else if (sortedProducts) {
      res.render("users/shop", { user: true, categories, userName, sortedProducts, minPrice, maxPrice });
      req.session.sortedProduct = false;
      req.session.maxPrice = false;
      req.session.minPrice = false;
    } else {
      req.session.category = false;
      req.session.filteredProduct = false;
      req.session.sortedProduct = false;
      req.session.maxPrice = false;
      req.session.minPrice = false;
      productHelpers.getProducts(currentPage).then((products) => {
        res.render("users/shop", { user: true, categories, userName, products, currentPage, totalPages });
      })
        .catch((err) => {
          console.log(err);
        });
    }
  },


  //User Conatct Page
  contactPage: (req, res) => {
    const userName = req.session.userName;
    res.render("users/contact", { user: true, userName });
  },


  // Category Filter
  categoryFilter: async (req, res) => {
    const userName = req.session.userName;
    const catName = req.params.name;
    req.session.category = catName;

    const currentPage = req.query.page || 1;
    const totalPages = await categoryHelpers.totalPages(catName);
    const categories = await productHelpers.getListedCategory();
    try {
      categoryHelpers.getSelectedCategory(catName, currentPage)
        .then((products) => {
          res.render("users/shop", {
            user: true,
            categories,
            currentPage,
            totalPages,
            userName,
            products
          });
        })
        .catch(() => {
          res.redirect("/shop");
        });
    } catch (err) {
      res.redirect("/shop");
    }
  },


  // User Profile
  userProfile: async (req, res) => {
    const userName = req.session.userName;
    const userProfile = await userHelpers.getUser(req.session.user._id);
    res.render("users/userProfile", { user: true, userName, userDetailes: req.session.user, userProfile });
  },

  userProfilePost: (req, res) => {
    try {
      const userId = req.session.user._id;
      userHelpers.editProfile(userId, req.body).then(() => {
        if (req.body.oldPassword != req.body.newPassword) {
          userHelpers.editPassword(userId, req.body).then((response) => {
            if (response) {
              req.session.changePassword = "";
              res.redirect("/userProfile");
            } else {
              req.session.changePassword = "Invalid old password";
              res.redirect("/userProfile");
            }
          });
        } else {
          req.session.changePassword = "";
          res.redirect("/userProfile");
        }
      });
    } catch (err) {
      console.log(err);
    }
  },

  manageAddress: async (req, res) => {
    const userName = req.session.userName;
    const addresses = await userHelpers.getAddress(req.session.user._id);
    res.render("users/manageAddress", { user: true, userName, addresses });
  },

  profileImage: async (req, res) => {
    const imageUrl = req.file;
    const userId = req.session.user._id;
    try {
      const result = await cloudinary.uploader.upload(imageUrl.path);

      if (result) {
        res.json({
          status: true,
          data: result.url,
        })

        await userHelpers.profileImage(userId, result.url);
      } else {
        console.log("Image Not Found")
      }

    } catch (error) {
      console.log(error);
    }

  },


  // Product Quantity
  changeProductQuantity: (req, res, next) => {
    try {
      cartHelpers
        .changeProductQuantity(req.session.user._id, req.body)
        .then(async (response) => {
          if (!response.removeProduct) {
            response.total = await cartHelpers.getCartTotal(req.session.user._id);
            res.json(response);
          } else {
            res.json(response);
          }
        });
    } catch (err) {
      console.log(err);
    }
  },


  // Orders Page
  orders: async (req, res) => {
    const userName = req.session.userName;
    const userId = req.session.user._id;
    const orders = await userHelpers.getOrders(userId);

    orders.forEach(order => {
      order.isCancelled = order.status === "Cancelled" ? true : false;
      order.isDelivered = order.status === "Delivered" ? true : false;
      order.isReturned = order.status === "Return" ? true : false;
      order.isFailed = order.status === "failed" ? true : false;

      const orderDate = new Date(order.date);
      const currentDate = new Date();

      const timeDifference = currentDate - orderDate;
      const millisecondsInADay = 24 * 60 * 60 * 1000;
      let daysDifference = timeDifference / millisecondsInADay;

      daysDifference =  daysDifference.toFixed(0);
      order.isReturn = daysDifference>7
      console.log(order.isReturned, order.status, order.isReturn);

      const newDate = new Date(order.date);
      const year = newDate.getFullYear();
      const month = newDate.getMonth() + 1;
      const day = newDate.getDate();
      const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
      order.date = formattedDate;

    });
    res.render("users/orders", { user: true, userName, orders });
  },

  cancelOrder: (req, res) => {
    const orderId = req.params.id;
    const reason = req.body.reason;
    userHelpers.cancelOrder(orderId, reason).then(() => {
      res.redirect("back");
    });
  },

  retunOrder: (req, res) => {
    const orderId = req.params.id;
    const reason = req.body.reason;
    console.log(reason + "vannnnnnnnnnnnnnnnuuuuuuuuuuuuuuuuuuuuuuuuuu");
    userHelpers.returnProduct(orderId, reason).then(() => {
      res.redirect('back');
    })
  },


  //Order View Page
  viewDet: async (req, res) => {
    const userName = req.session.userName;
    const orderId = req.params.id;
    const orders = await userHelpers.getOrderedProducts(orderId);
    console.log(orders + "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    res.render("users/viewDet", { user: true, userName, orders });
  },


  //Wishlist
  wishlist: async (req, res) => {
    const userName = req.session.userName;
    const wishlist = await userHelpers.getWishlist(req.session.user._id);
    res.render("users/wishlist", { user: true, userName, wishlist });
  },

  wishlistPage: (req, res) => {
    const productId = req.params.id;
    userHelpers.addToWishlist(req.session.user._id, productId);
    res.json({
      status: "success",
      message: "added to Wishlist",
    });
  },

  deleteWishlist: (req, res) => {
    const userId = req.session.user._id;
    const productId = req.params.id;
    userHelpers.deleteWishlist(userId, productId);
    res.redirect("back");
  },


  //Price Sort Filter
  priceFilter: async (req, res) => {
    try {
      req.session.minPrice = req.body.minPrice;
      req.session.maxPrice = req.body.maxPrice;
      const category = req.session.category;
      req.session.filteredProduct = await productHelpers.filterPrice(req.session.minPrice, req.session.maxPrice, category);
      res.json({
        status: "success",
      });
    } catch (err) {
      console.log(err);
    }
  },

  sortPrice: async (req, res) => {
    try {
      req.session.minPrice = req.body.minPrice;
      req.session.maxPrice = req.body.maxPrice;
      const category = req.session.category;
      req.session.sortedProduct = await productHelpers.sortPrice(req.body, category);

      res.json({
        status: "success",
      });
    } catch (err) {
      console.log(err);
    }
  },


  //Razorpay
  verifyPayment: (req, res) => {
    try {
      console.log(req.body + "verify payment");
      userHelpers.verifyPayment(req.body).then(() => {
        userHelpers.changeOrderStatus(req.body.order.receipt).then(() => {
          res.json({
            status: true,
          });
        });
      });
    } catch (err) {
      console.log(err);
    }
  },


  // Coupon
  couponApply: (req, res) => {
    const userId = req.session.user._id;
    userHelpers.couponApply(req.body.couponCode, userId).then((coupon) => {
      if (coupon) {
        if (coupon === 'couponExists') {
          res.json({
            status: "coupon is already used, try another coupon"
          })
        } else {
          res.json({
            status: "success",
            coupon: coupon
          })
        }
      } else {
        res.json({
          status: "coupon is not valid !!"
        })
      }
    });
  },


  // Paypal
  paypalSuccess: (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: "25.00",
          },
        },
      ],
    };
    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
      const userName = req.session.userName;
      if (error) {
        userHelpers.changeOrderPaymentStatus(req.session.orderId).then(() => {
          console.log("changed");
          res.render('users/failure', { user: req.session.user, userName });
        }).catch(() => { });
      } else {
        res.render('users/success', { user: req.session.user, payerId, paymentId, userName });
      }
    }
    );
  },

  failure: (req, res) => {
    res.render('users/failure', { user: true, userName: req.session.userName });
  },

  getWallet: async (req, res) => {
    const wallet = await userHelpers.getWallet();
    res.render('users/wallet', { user: true, userName: req.session.userName, wallet })
  }

}
