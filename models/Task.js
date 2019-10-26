var mongo = require("mongodb");

const { to } = require("../services/util.service");
const db = require("../db").getDb();

const { ucwords } = require("../helpers/basicFunc");



const add = async ({ name, asset_id, description, skills, time, is_active}) => {
    try {
        asset_id = new mongo.ObjectID(asset_id);
        let savedTask = await db
            .db()
            .collection("tasks")
            .insertOne({ name, asset_id, description, skills, time, is_active});

            savedTask = savedTask.ops[0];

        return Promise.resolve(savedTask);

    } catch (err) {
        return Promise.reject(err);
    }
}

const getAll = async (asset_id)=>{
    try {
        let tasks = await db
            .db()
            .collection("tasks")
            .find({asset_id: new mongo.ObjectID(asset_id)}).toArray();
        return Promise.resolve(tasks);

    } catch (err) {
        return Promise.reject(err);
    }

}

const getTask = async (task_id)=>{
    try {

        let task = await db
            .db()
            .collection("tasks")
            .findOne({_id: new mongo.ObjectID(task_id)});
            
        return Promise.resolve(task);

    } catch (err) {
        return Promise.reject(err);
    }
}




module.exports = {
    add,
    getAll,
    getTask
}