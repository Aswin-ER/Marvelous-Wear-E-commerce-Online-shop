const db = require('../configurations/connection');
const collection = require('../configurations/collections');
const objectId = require('mongodb-legacy').ObjectId;

module.exports = {

//Admin Login
    doAdminLogin: (adminDetails) => {
        return new Promise ( async (resolve, reject) => {
            const response = {};
            const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email: adminDetails.email});
            if(admin){
                if(admin.password == adminDetails.password){
                    response.admin = admin;
                    resolve(response);
                }else{
                    response.status = "Invalid password";
                    resolve(response);
                }
            }else{
                response.status = "Invalid user";
                resolve(response);
            }
        })
    },

    
//User CRUD
    getUser: () => {
        return new Promise ( async (resolve, reject) => {
            const userData = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(userData);
            // reject("No user Found")
        })
    },

    editUser: (userId, data) => {
        return new Promise ((resolve, reject) => {
            userId = new objectId(userId);
            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id: new objectId(userId)
                },
                {
                    $set: {
                        name: data.name,
                        email: data.email,
                        phone: Number(data.phone),
                    }
                }
            ).then((response) => {
                console.log(response);
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            })
        })
    },

    deletUser: (userId) => {
        return new Promise((resolve, reject) => {
            userId = new objectId(userId);
            db.get().collection(collection.USER_COLLECTION).deleteOne(
                {
                    _id: new objectId(userId)
                }
            ).then((response) => {
                console.log(response);
                resolve();
            }).catch((err) => {
                console.log(err);
                reject();
            })
        })
    },

    blockUser: (userId) => {
        return new Promise ( async (resolve, reject) => {
            userId = new objectId(userId);

            const user = await db.get().collection(collection.USER_COLLECTION).findOne(
                {
                    _id: new objectId(userId)
                }
            )
            console.log(user);
            if(user.status == true){
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        _id: new objectId(userId)
                    },
                    {
                        $set: {
                            status: false
                        }
                    }
                ).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    reject(err);
                })
            }else{
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        _id: new objectId(userId)
                    },
                    {
                        $set: {
                            status: true
                        }
                    }
                ).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    reject(err);
                })
            }
        })
    },

    getUserOrder:() => {
        return new Promise(async(resolve, reject) => {
            const userDet = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
            // console.log('usersdefdinv', userDet);
            resolve(userDet);
        });
    },

    adminOrderStatus:(orderId,status)=>{
        return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({

          _id: new objectId(orderId),
        //   order:{$elemMatch:{id: new objectId(orderId)}}

        },
        {
          $set: {
            "status": status,
            }
        }).then((response)=>{
            // console.log(response+"111111111111111111111122222222222222211111111");
            resolve(response)
        })
      })
      }

}