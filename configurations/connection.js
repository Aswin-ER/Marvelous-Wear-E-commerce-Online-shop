const mongoClient = require('mongodb-legacy').MongoClient;
const state = {
    db: null
}

module.exports.connect = function(done){
    const url = 'mongodb://0.0.0.0:27017'
    const dbname = 'marvelousWear'

    mongoClient.connect(url, (err, data) => {
        if(err){
            return done(err);
        }else{
            state.db = data.db(dbname);
        }
        done();
    })
}

module.exports.get = function(){
    return state.db
}