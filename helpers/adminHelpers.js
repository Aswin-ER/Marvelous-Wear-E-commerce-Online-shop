const db = require('../configurations/connection');
const collection = require('../configurations/collections');

module.exports = {
    
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

    getUser: () => {
        return new Promise ( async (resolve, reject) => {
            const data = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(data);
            // reject("No user Found")
        })
    },
}