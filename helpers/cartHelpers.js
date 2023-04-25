const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {
    addToCart:  (productId, user, quantity)=> {
        productId = new objectId(productId);
        return new Promise (async (resolve, reject) => {
           const findUser = await db.get().collection(collection.CART_COLLECTION).findOne(
                {
                    userId: new objectId(user)
                }
            )

            let productExist = await db.get().collection(collection.CART_COLLECTION).findOne(
                 {
                     userId: new objectId(user),
                     product: {$elemMatch:{productId}}
                 }
             );
            if(findUser){
                if(productExist){

                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        {
                            userId: new objectId(user),
                            product:{$elemMatch:{productId}}
                        },{
                            $inc:{'product.$.quantity': quantity}
                        }
                    ).then(()=>{resolve()})
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        {
                            userId: new objectId(user),
                        },
                        {
                            $push: {product:{productId, quantity: Number(quantity)}}
                        }
                    ).then(()=>{resolve()})

                }  

            }else{
                const cartObject = {
                    userId: new objectId(user),
                    product: [{productId:productId, quantity: Number(quantity)}]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then((response) => {
                    resolve(response);
                }).catch((err) => {
                    reject(err);
                })
            }
        });
    },

    getCart: (userId)=> {
        return new Promise ( async (resolve, reject)=> {
        const userDetailes = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match: {
                    userId: new objectId(userId)
                }
            },
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: 'product', 
                    localField: 'product.productId', 
                    foreignField: '_id', 
                    as: 'result'
                }
            },
            {
                $project: {
                      _id: 0, 
                      product: {
                        $arrayElemAt: [
                          '$result', 0
                        ]
                      }, 
                      quantity: '$product.quantity'
                }
            }
        ]).toArray();
        resolve(userDetailes);

        });
    },

    deleteCart:(productId, userId)=> {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                {
                    userId: new objectId(userId)
                },
                {
                    $pull: {
                        product: {productId: new objectId(productId)}
                    }
                }
            ).then((response) => {
                resolve();
            })
        })
    },

    deleteCartFull : (userId) => {
        return new Promise (async (resolve, reject) => {
           await db.get().collection(collection.CART_COLLECTION).deleteOne(
                {
                    userId: new objectId(userId)
                }
            )
        });
    },

    changeProductQuantity:(userId,details)=>{
       const productId = new objectId(details.product)
        
        const count=parseInt(details.count)
        const quantity=parseInt(details.quantity)
  
        return new Promise((resolve,reject)=>{
  
          if(count==-1 && quantity==1){
            db.get().collection(collection.CART_COLLECTION)
            .updateOne(
              {userId: new objectId(userId)},
              {
                $pull:{product:{productId: productId}}
              }
              )
              .then((response)=>{resolve({removeProduct:true})})
          }else{
          db.get().collection(collection.CART_COLLECTION)
          .updateOne(
                  {
                    userId: new objectId(userId), 
                    product:{$elemMatch:{productId}}
                },
            {
              $inc:{'product.$.quantity':count}
            }
          )
          .then((response)=>{resolve({status:true})})
          }
        })
      },
  
      getCartTotal:(userId)=>{
          return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { 
                     userId: new objectId(userId) }
              },
              {
                $unwind: "$product"
              },
              {
                $lookup: {
                  from: 'product',
                  localField: 'product.productId',
                  foreignField: "_id",
                  as: "result"
                }
              },
              {
                  $project: {
                    _id: 0,
                    product: { $arrayElemAt: ["$result", 0] },
                    quantity: "$product.quantity"
                  }
                },
                {
                  $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity','$product.price']}}
                  }
                }
            ]).toArray()
              .then((response) => {
                  resolve(response[0].total)
              })
              .catch((err) => {
                reject(err);
              });
          });      
      },

      
}