const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {

//Product CRUD
    addProducts: (product) => {
        return new Promise((resolve, reject)=>{
            product.price = Number(product.price);
            product.stock = Number(product.stock);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data.insertedId);
            })
        })
    },

    getProducts:() => {
        return new Promise (async (resolve, reject) => {
            const productData = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            if(productData){
                resolve(productData);
            }else{
                resolve("No data to show")
            }
        })
    },

    getSingleProduct: (productId) => {
        return new Promise (async (resolve, reject) =>{
            const productSingleData = await db.get().collection(collection.PRODUCT_COLLECTION).findOne(
                {
                    _id: new objectId(productId)
                });
                // console.log(productSingleData);
                resolve(productSingleData);
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
    }
}