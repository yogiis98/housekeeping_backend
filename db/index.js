const {MongoClient} = require('mongodb');
const CONFIG = require('../config/keys.js');

let _db;

const initDb = async ()=>{
        if(_db){
           return _db; 
        }
        let client = await MongoClient.connect(CONFIG.mongoNewURI,{
            useNewUrlParser: true 
        })
        console.log("Connected to mongodb");
        _db = client;
        return _db;
}

const getDb = ()=>{
    if(!_db){
        throw Error('Database not initalized');
    }
    return _db;
};

module.exports = {
    initDb,
    getDb
}