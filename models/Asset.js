var mongo = require("mongodb");

const { to } = require("../services/util.service");
const db = require("../db").getDb();

const { ucwords } = require("../helpers/basicFunc");


const add = async ({ name, image, is_active}) => {
    try {

        let savedAsset = await db
            .db()
            .collection("assets")
            .insertOne({name, image, is_active});

            savedAsset = savedAsset.ops[0];

        return Promise.resolve(savedAsset);

    } catch (err) {
        return Promise.reject(err);
    }
}


const getAll = async () => {
    try {

        let assets = await db
            .db()
            .collection("assets")
            .find({}).toArray();
            
        return Promise.resolve(assets);

    } catch (err) {
        return Promise.reject(err);
    }
}

const getAsset = async (asset_id)=>{
    try {

        let asset = await db
            .db()
            .collection("assets")
            .findOne({_id: new mongo.ObjectID(asset_id)});
            
        return Promise.resolve(asset);

    } catch (err) {
        return Promise.reject(err);
    }
}

module.exports = {
    add,
    getAll,
    getAsset
}