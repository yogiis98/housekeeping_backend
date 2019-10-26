var mongo = require("mongodb");

const { to } = require("../services/util.service");
const db = require("../db").getDb();

const { ucwords } = require("../helpers/basicFunc");


const add = async ({ name, skills}) => {
    try {
        let tasks = []
        let savedWorker = await db
            .db()
            .collection("workers")
            .insertOne({ name, skills, tasks});

            savedWorker = savedWorker.ops[0];

        return Promise.resolve(savedWorker);

    } catch (err) {
        return Promise.reject(err);
    }
}

const getWorkersForTaskSkills = async (skills=[])=>{
    // console.log(skills);
    try{
        let workers = await db
        .db()
        .collection("workers")
        .find({skills:{$in:skills}}).project({tasks:0}).toArray();

        return Promise.resolve(workers);

    }catch(err){
        return Promise.reject(err);
    }
}

const getWorker = async (worker_id)=>{
    try{
        let worker = await db
            .db()
            .collection("workers")
            .findOne({_id: new mongo.ObjectID(worker_id)});
        return Promise.resolve(worker);

    }catch(err){
        return Promise.reject(err);
    }
}

const addTaskToWorker = async (worker_id,task)=>{
    try {
        let savedWorker = await db
            .db()
            .collection("workers")
            .findOneAndUpdate({_id:new mongo.ObjectID(worker_id)}, { $push: {
                tasks:{
                    $each:[task],
                    $position:0
                }
            } }, { returnOriginal: false });
        return Promise.resolve(savedWorker.value.tasks[0]);
    } catch (err) {
        return Promise.reject(err);
    }
}

const getAll = async ()=>{
    try {
        let workers = await db
            .db()
            .collection("workers")
            .find({}).project({tasks:0}).toArray();
        return Promise.resolve(workers);

    } catch (err) {
        return Promise.reject(err);
    }

}

const getWorkerFull = async (worker_id)=>{
  // console.log(worker_id)
    try {
        workerWithTasks = await db
            .db()
            .collection("workers")
            .aggregate([
                {
                  '$match': {
                    '_id': new mongo.ObjectId(worker_id)
                  }
                }, {
                  '$unwind': {
                    'path': '$tasks',
                    preserveNullAndEmptyArrays:true
                  }
                }, {
                  '$lookup': {
                    'from': 'tasks', 
                    'localField': 'tasks.task_id', 
                    'foreignField': '_id', 
                    'as': 'tasks.task_data'
                  }
                }, {
                  '$unwind': {
                    'path': '$tasks.task_data',
                    preserveNullAndEmptyArrays:true
                  }
                }, {
                  '$lookup': {
                    'from': 'assets', 
                    'localField': 'tasks.asset_id', 
                    'foreignField': '_id', 
                    'as': 'tasks.asset_data'
                  }
                }, {
                  '$unwind': {
                    'path': '$tasks.asset_data',
                    preserveNullAndEmptyArrays:true
                  }
                }, {
                  '$group': {
                    '_id': '$_id', 
                    'name': {
                      '$first': '$name'
                    }, 
                    'skills': {
                      '$first': '$skills'
                    }, 
                    'tasks': {
                      '$push': '$tasks'
                    }
                  }
                }
              ])
            .toArray();
            // console.log(workerWithTasks);
        return Promise.resolve(workerWithTasks[0]);
    } catch (err){
        return Promise.reject(err);
    }
}

module.exports = {
    add,
    getWorkersForTaskSkills,
    getWorker,
    addTaskToWorker,
    getAll,
    getWorkerFull
}