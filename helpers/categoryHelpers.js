const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {
    addCategory:(detailes) => {
        return new Promise (async (resolve, reject) => {
                const Category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({name: detailes.name})
                if(Category){
                    reject('Category already exists');
                }else{
                    detailes.listed = true;
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(detailes).then( (response) => {
                        db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
                            {
                                category: detailes.name
                            },
                            {
                                $set: {
                                    listed: true
                                }
                            }
                        )
                        resolve(response.insertedId);
                    })
                }
        })
    },

    getCategory: () => {
        return new Promise (async (resolve, reject) => {
           const category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
            if(category){
                console.log(category);
                resolve(category)
            }else{
                
                resolve("Category not found");
            }
        })
    },

    deleteCategory: (categoryId, cateName) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne(
                {
                    _id: new objectId(categoryId)
                }
            ).then(async () => {
                const listed = await db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
                    {
                        category: cateName
                    },
                    {
                        $set: {
                            listed: false
                        }
                    }
                )
                console.log(listed);
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            })
        })
    },

    getSelectedCategory:(catName, currentPage)=>{
        // console.log(catName);
        return new Promise(async(resolve, reject)=>{
            currentPage = parseInt(currentPage);
            const limit = 8;
            const skip = (currentPage - 1)* limit;

            try{
                const products = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate(
                    [
                        {
                          '$match': {
                            'name': catName
                          }
                          
                        }, {
                          '$lookup': {
                            'from': collection.PRODUCT_COLLECTION, 
                            'localField': 'name', 
                            'foreignField': 'category', 
                            'as': 'productDetails'
                          }
                        },

                        {
                            $match: {
                                listed: true
                            }
                        },
                         
                        {
                          '$project': {
                            'productDetails': 1, 
                            '_id': 0
                          }
                        }
                    ]).skip(skip).limit(limit).toArray();
                    console.log(products+"asasassasasasasa");
                resolve(products[0].productDetails);
            }catch{
                resolve(null);
            }
        })
    },

    totalPages:(category)=> {
        return new Promise((resolve, reject) => {
            const count = db.get().collection(collection.CATEGORY_COLLECTION).aggregate(
                [
                    {
                      '$match': {
                        'name': category
                      }
                    }, {
                      '$lookup': {
                        'from': 'product', 
                        'localField': 'name', 
                        'foreignField': 'category', 
                        'as': 'productDetails'
                      }
                    }, {    
                      '$unwind': '$productDetails'
                    }, {
                      '$count': 'totalProducts'
                    }
            ]).toArray()
            .then((count) => {
                const totalCount = count[0].totalProducts;
                console.log(totalCount+"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                resolve(totalCount);
            }).catch((err) => {
                console.log(err);
            })
            
        })
    }
}