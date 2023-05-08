const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const bcrypt = require('bcrypt');
const objectId = require('mongodb-legacy').ObjectId;
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay_key_id = process.env.RAZORPAY_KEY_ID;
const razorpay_key_secret = process.env.RAZORPAY_KEY_SECRET;

var instance = new Razorpay({
     key_id: razorpay_key_id, 
     key_secret: razorpay_key_secret, 
    })

module.exports = {
    
//User Signup & Login
    doSignUp: (userDetails) => {
        return new Promise(async (resolve, reject) => {
            const findUserExist = await db.get().collection(collection.USER_COLLECTION).findOne({email: userDetails.email});
            if(!findUserExist || userDetails.email !== findUserExist.email){
                Object.assign(userDetails, {status: true});
                userDetails.password = await bcrypt.hash(userDetails.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((response) => {
                console.log(response);
                resolve(response);
            }).catch((err) => {
                console.log(err);
                reject(err);
            })
            }else{
                resolve("Email already exist!!!");
            }
            
        })
    },

    doLogin: (userDetails) => {
        return new Promise( async (resolve, reject) => {
            const response ={};
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userDetails.email});
            if(user){
                    if(user.status == false){
                        response.status = "User Blocked!!!";
                        resolve(response);
                    }

                    bcrypt.compare(userDetails.password, user.password).then((status) => {
                        if(status){
                            response.user = user;
                            resolve(response);
                        }else{
                            response.status = "Invalid Password";
                            resolve(response);
                        }
                    });     
                
            }else{
                response.status = "Invalid User";
                resolve(response);
            }
    });

    },


// User Profile
    editProfile: (userId, info) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: new objectId(userId)
                },
                {
                    $set:{
                        name: info.name,
                        email: info.email,
                        phone: info.phone
                    }
                }
            ).then((response) => {
                resolve(response);
            })
        })
    },

    editPassword: (userId, info) => {
        return new Promise( async (resolve, reject) => {
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: new objectId(userId)
            })
            const userPassword = await bcrypt.hash(info.newPassword, 10);
            bcrypt.compare(info.oldPassword, info.newPassword).then((status) => {
                if(status){
                    db.get().collection(collection.USER_COLLECTION).updateOne(
                        {
                            _id: new objectId(userId)
                        },
                        {
                            $set: {
                                password: userPassword
                            }
                        }
                    )
                    status = true;
                    resolve(status);
                }else{
                    status = false;
                    reject(false);
                }
            })
            resolve(user);
        })
    },



//Address 
    getAddress:(userId) => {
        return new Promise ( async (resolve, reject) => {
            const userAddress = await db.get().collection(collection.USER_COLLECTION).findOne(
                {
                    _id: new objectId(userId),
                }
            );
            try{
                const addresses = userAddress.address;
                resolve(addresses);
            }catch{
                resolve("No addresses added")
            }
        })
    },

    addAddress: (address, userId) => {
        return new Promise ((resolve , reject) => {
            // address.active = false;
            address.phone = Number(address.phone);
            address.postCode = Number(address.postCode);
            userId = new objectId(userId);
            address._id = new objectId();
            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                   _id: new objectId(userId),
                },
                {
                    $push:{address: address}
                }
            );
        })
    },

    editAddress: (info, userId, address) => {
        return new Promise( async (resolve, reject) => {
           await db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: new objectId(userId),
                    "address._id":new objectId(address)
                },
                {
                    $set: {
                        "address.$.state": info.state,
                       "address.$.name": info.name,
                       "address.$.phone": Number(info.phone),
                       "address.$.address": info.address,
                       "address.$.city": info.city,
                       "address.$.postCode": info.postCode,
                       "address.$.type": info.type
                    }
                }
            );
        })
    },

    deleteAddress:(addressId,userId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.USER_COLLECTION)
          .updateOne(
            {
              _id: new objectId(userId),
              "address._id": new objectId(addressId) // match the address with the specified id
            },{
              $pull: { address: { _id: new objectId(addressId) } }
            }
        )
        })
    },

    // not used because of bug ;
    // changeAddressActive: (userId, addressId) => {
    //     return new Promise ((resolve, reject)=> {
    //         db.get().collection(collection.USER_COLLECTION)
    //         .updateMany(
    //             {
    //                 _id: new objectId(userId),
    //             },
    //             {
    //                 $set:{"address.$[].active": false}
    //             }
    //         );
    //         db.get().collection(collection.USER_COLLECTION)
    //         .updateOne(
    //             {
    //                 _id:  new objectId(userId),
    //                 address: {$elemMatch: { _id: new objectId(addressId)}}
    //             },
    //             {
    //                 $set: {"address.$.active": true}
    //             }
    //         )
    //         .then((response)=>{
    //             resolve(response);
    //         });
    //     });
    // },

    findAddress:(addressId, userId)=>{
        return new Promise(async(resolve, reject)=>{
            const address = await db.get().collection(collection.USER_COLLECTION).aggregate([ 
                { $match: { _id: new objectId(userId) } }, 
                { $unwind: "$address" }, 
                { $match: { "address._id": new objectId(addressId) } }, 
                { $project: { _id: 0, address: 1 } } 
                ]).toArray();
                resolve(address[0].address)
        })
    },


// Orders
    getOrders:(userId)=> {
        return new Promise(async(resolve, reject)=>{
            userId = new objectId(userId);
            const orders = await db.get().collection(collection.ORDER_COLLECTION).find(
                {
                    userId: userId
                }
                ).sort({date: -1}).toArray();
            // console.log(orders+"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
            resolve(orders);
        })
    },

    addOrderDetails: (order) => {
        // Object.assign(order, {status: "pending"});
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION).insertOne(order)
          .then(async (response)=>{
            resolve(response);
            for(let i =0 ; i < order.item.length;i++){
                const stock = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    {
                        _id: order.item[i].product._id
                    },
                    {
                        $inc: {
                            stock: -order.item[i].quantity
                        }
                    }
                )
            }
          })
          .catch((err)=>{
            reject(err);
          })
        })
      },

       getOrderedProducts:(ordersId)=>{ 
        return new Promise(async(resolve, reject)=>{ 
        ordersId =  new objectId(ordersId); 
        console.log(ordersId);
        const orders = await db.get().collection(collection.ORDER_COLLECTION).find({_id: ordersId}).toArray();
        //                 { 
        //                   '$match': { 
        //                     '_id': ordersId 
        //                   } 
        //                 }, { 
        //                   '$unwind': { 
        //                     'path': '$products', 
        //                     'includeArrayIndex': 'string',  
        //                     'preserveNullAndEmptyArrays': true 
        //                   } 
        //                 }, { 
        //                   '$lookup': { 
        //                     'from': 'product',  
        //                     'localField': 'product.productId',  
        //                     'foreignField': '_id',  
        //                     'as': 'productDetails' 
        //                   } 
        //                 }, { 
        //                   '$project': { 
        //                     'productDetails': 1,  
        //                     '_id': 0, 
        //                     'products.quantity' : 1 
        //                   } 
        //                 } 
        //             ]).toArray(); 
        // console.log(orders);
        // console.log(orders[0].productDetails); 
        console.log(orders);
        resolve(orders); 
    });
},

      cancelOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.ORDER_COLLECTION)
          .updateOne({
            _id: new objectId(orderId),
            
          },
          {
            $set: {
              "status": "Cancelled",
              }
          })
          .then((response)=>{resolve(response)})
        })
      },

      addToWishlist: (userId, productId) => {
        productId = new objectId(productId);

        return new Promise(async (resolve, reject) => {
            const finduser = await db.get().collection(collection.WISHLIST_COLLECTION).findOne(
                {
                    userId: new objectId(userId)
                }
            )

            let productExist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne(
                {
                    userId: new objectId(userId),
                    product:{$elemMatch:{productId}}
                }
            );

            if(finduser){
                if(!productExist){
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                        {
                            userId: new objectId(userId)
                        },
                        {
                            $push: {product: {productId}}
                        }
                    ).then(()=>{resolve()})
                    
                }else{
                    resolve();
                }

            }else{
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(
                    {
                        userId: new objectId(userId),
                        product: [{productId: productId}],
                    }
                ).then((response) => {
                    resolve(response);
                }).catch((err) => {
                    reject(err);
                })
            }
        });
      },

      getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        '$match': {
                            'userId': new objectId(userId)
                        }
                    },
                    {
                        '$unwind': {
                            'path': '$product'
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'product',
                            'localField': 'product.productId',
                            'foreignField': '_id',
                            'as': 'result'
                        }
                    },
                    {
                        '$project': {
                            '_id': 0,
                            'product': {
                                '$arrayElemAt': [
                                    '$result', 0
                                ]
                            }
                        }
                    }
                ]).toArray();
                resolve(wishlist);
            } catch (err) {
                console.log(err);
                reject(err);
            }
        })
    },

    deleteWishlist:(userId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                {
                    userId: new objectId(userId),
                },
                {
                    $pull:{
                        product: {productId: new objectId(productId)}
                    }
                }
            )
            resolve();
        })
    },


//Razorpay
    generateRazorpay:(orderId, total) => {
        return new Promise ((resolve, reject) => {
            total = Number(total).toFixed(0);
            orderId = String(orderId);
            instance.orders.create({
                amount: parseInt(total) * 100,
                currency: "INR",
                receipt: orderId,
              },(err, order)=> {
            if(err){
                console.log(err);
                reject(err);
            }else{
                
                resolve(order);
            }
        })

    })


    },

    verifyPayment:(details)=>{
        return new Promise((resolve, reject)=>{            
            let hmac = crypto.createHmac('sha256', razorpay_key_secret);
             
            hmac.update(details.response.razorpay_order_id + '|' + details.response.razorpay_payment_id);
            hmac = hmac.digest('hex');
            // console.log( "ok da monu sugam alle", JSON.stringify(details));
            if(hmac===details.response.razorpay_signature){
                resolve();
            }else{
                reject();
            }
        });
    },

    changeOrderStatus:(orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {
                    _id: new objectId(orderId)
                },
                {
                    $set: {
                        status: "placed"
                    }
                }
            ).then((response) => {
                resolve(response)
            }).catch((err) => {
                
                console.log(err);
            })
        })
    },

    doLoginWithMobile: (mobile)=> {
        return new Promise(async (resolve, reject) => {
            // mobile = Number(mobile);

            let response= {};
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({phone: mobile});
            if(user){
                response.user = user;
                response.status = true;
                response.isBlocked = user.isblocked;
                resolve(response);
            }else{
                response.status = false;
                resolve({status: false})
            }
        })
    },

    setNewPassword: (userDetails) => {
        return new Promise( async (resolve, reject)=> {

            const mobile = userDetails.mobile;

            let userPassword = await bcrypt.hash(userDetails.password, 10);
            db.get().collection(collection.USER_COLLECTION).updateOne({phone: mobile},
                {
                    $set: {
                        password: userPassword
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },

    getUser:(userId)=> {

        return new Promise((resolve, reject) => {

            const user = db.get().collection(collection.USER_COLLECTION).findOne(
                {
                    _id: new objectId(userId)
                }
            )
            console.log(user);
            resolve(user);
        })
    },

    returnProduct:(orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {
                    _id: new objectId(orderId)
                },
                {
                    $set: {
                        status: "Return"
                    }
                }
            ).then((response) => {resolve(response)})
        })
    }

}