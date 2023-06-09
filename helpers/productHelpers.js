const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {

//Product CRUD
    addProducts: (product) => {
        return new Promise((resolve, reject)=>{
            product.price = Number(product.price);
            product.stock = Number(product.stock);

            if(product.price <= 0 || product.stock <= 0){
                resolve();
            }else{
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {

                     db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                        {
                            _id: new objectId(data.insertedId)
                        },
                        {
                            $set: {
                                listed: true
                            }
                        }
                    )


                    resolve(data.insertedId);
                })
            }
            
        })
    },

    getProducts:(currentPage) => {
        return new Promise (async (resolve, reject) => {
            currentPage = parseInt(currentPage);
            const limit = 8;
            const skip = (currentPage-1)*limit;
            const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find(
                {
                    listed: true
                }
            ).skip(skip).limit(limit).toArray();
            if(productData){
                resolve(productData);
            }else{
                resolve("No data to show")
            }
        })
    },

    getAdminProducts:(currentPage) => {
        return new Promise (async (resolve, reject) => {
            const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            if(productData){
                resolve(productData);
            }else{
                resolve("No data to show")
            }
        })
    },

    getSomeProducts:() => {
        return new Promise(async (resolve, reject) => {
            const someProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(8).toArray();
            if(someProduct){
                resolve(someProduct)
            }else{
                resolve("No data found");
            }
        })
    },

    getSingleProduct: (productId) => {
        return new Promise (async (resolve, reject) =>{
            const productSingleData = await db.get().collection(collection.PRODUCT_COLLECTION).findOne(
                {
                    _id: new objectId(productId)
                });
                console.log(productSingleData);
                resolve(productSingleData);
            })
    },

    getRelatedProducts:(category) => {
        return new Promise (async (resolve, reject) => {
            const getRelatedProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                category: category
            }).limit(4).toArray();
            if(getRelatedProduct){
                resolve(getRelatedProduct)
            }else{
                resolve("No data Found");
            }
        })
    },

    editProduct: (productId, data) => {
        return new Promise ((resolve , reject) => {
            console.log(data)
            productId = new objectId (productId)
             db.get().collection(collection.PRODUCT_COLLECTION)
             .updateOne(
                {
                    _id: productId
                },
                {
                    $set: {
                        name: data.name,
                        category: data.category,
                        description: data.description,
                        price: Number(data.price),
                        stock: Number(data.stock),
                        listed: true,
                    }
                }
             ).then((response) => {
                console.log(response);
                resolve()
             }).catch((err) => {
                console.log(err);
                reject();
             })
        })
    },

    deleteProducts: (productId) => {
        return new Promise ((resolve, reject) => {
            console.log("hoooooooooooooooooooooooooo");
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne(
                {
                    _id: new objectId(productId)
                }
            )
            .then((response) => {
                console.log(response);
                resolve()
            })
            .catch((err) => {
                console.log(err);
                reject()
            })
        })
    },

    // searchProduct:(search)=> {
    //     return new Promise(async (resolve, reject)=> {
    //         const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find(
    //             {
    //                 name: { $regex : new RegExp(search), $options: "i"}
    //             }
    //         ).toArray();
    //         resolve(productData);
    //     });
    // },
    
    
//Product Image
    
    addProductImage:(id, imgUrls)=>{
        return new Promise((resolve, reject)=>{
            console.log("helpers")
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne(
                {
                    _id: new objectId(id)
                },
                {
                    $set:{
                        images: imgUrls
                    }
                }
            )
            .then((response)=>{
                console.log(response);
                resolve();
            })
            .catch((err)=>{
                console.log(err);
                reject()
            })
        })
    },

    editProductImage: (id, imgUrls) => {
        return new Promise ((resolve , reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne(
                {
                    _id: new objectId(id)
                },
                {
                    $set: {
                        images: imgUrls
                    }
                }
            ).then((response) => {
                console.log(response);
                resolve()
            }).catch((err) => {
                console.log(err);
                reject()
            })
        })
    },


// Product Category
    getListedCategory:()=>{
        return new Promise(async(resolve, reject)=>{
            const categories = await db.get().collection(collection.CATEGORY_COLLECTION).find(
                {
                    listed : true
                }
            ).toArray();
            console.log(categories);
            resolve(categories);
        })
    },


// Product Filter
    filterPrice: (minPrice, maxPrice, Category) => {
        return new Promise(async (resolve, reject) => {
          let filteredProducts;
          if (Category) {
            filteredProducts = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                $lookup: {
                  from: 'category',
                  localField: 'category',
                  foreignField: 'name',
                  as: 'result'
                }
              },
              {
                $match: {
                  category: Category
                }
              },
              {
                $match: {
                  price: {
                    $gte: parseInt(minPrice),
                    $lte: parseInt(maxPrice),
                  }
                }
              },

              {
                $match: {
                    listed: true,
                }
              }

            ]).toArray();
          } else {
            filteredProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({
              price: {
                $gte: parseInt(minPrice),
                $lte: parseInt(maxPrice),
              }, listed: true }).toArray();
          }
          resolve(filteredProducts);
        })
    },

    sortPrice:(detailes, category, currentPage) => {
        return new Promise (async (resolve, reject) => {
        try{
            const minPrice = Number(detailes.minPrice);
            const maxPrice = Number(detailes.maxPrice);
            const value = detailes.sort;
            let product;

            if(category){
                product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                      $lookup: {
                        from: 'category',
                        localField: 'category',
                        foreignField: 'name',
                        as: 'result'
                      }
                    },

                    {
                      $match: {
                        category: category
                      }
                    },

                    {
                      $match: {
                        price: {
                          $gte: parseInt(minPrice),
                          $lte: parseInt(maxPrice),
                        }
                      }
                    },

                    {
                        $match: {
                            listed: true,
                        }
                    }

                  ]).sort({price: value}).toArray();
            }else{
                product = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                    price: {$gte: parseInt(minPrice),$lte: parseInt(maxPrice)}, listed: true}).sort({price: value}).toArray();
            }
            resolve(product);
             
        }catch{
            console.log("Error");
        }
            
        });
    },

    totalPages:()=> {
        return new Promise(async (resolve, reject) => {
            const totalCount = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({});
            resolve(totalCount);
        })
    },

    totalOrdersPlaced:() => {
        return new Promise (async (resolve, reject) => {
            try{
                const orderPlacedCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({});
                resolve(orderPlacedCount);
            }catch{
                resolve(0)
            }
        })
    },
      

}