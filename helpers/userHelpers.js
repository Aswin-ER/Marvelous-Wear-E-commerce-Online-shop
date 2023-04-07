const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const bcrypt = require('bcrypt')

module.exports = {
    
    doSignUp: (userDetails) => {
        return new Promise(async (resolve, reject) => {
            const findUserExist = await db.get().collection(collection.USER_COLLECTION).findOne({email: userDetails.email});
            if(!findUserExist || userDetails.email !== findUserExist.email){
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
                bcrypt.compare(userDetails.password, user.password).then((status) => {
                    if(status){
                        response.user = user;
                        resolve(response);
                    }else{
                        response.status = "Invalid Password";
                        resolve(response);
                    }
                }).catch((err) => {
                    console.log(err);
                });

            }else{
                response.status = "Invalid User";
                resolve(response);
            }
        })
    },
    getAllProducts:()=>{
        return new Promise((resolve, reject)=>{
            const products = db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            console.log(products);
            resolve(products);
        });
    }
}