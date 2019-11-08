const CONFIG = require("../config/keys");
var mongo = require("mongodb");

const Task = require("../models/Task");
const Asset = require("../models/Asset");
const Worker = require("../models/Worker");

const { to, ReE, ReS } = require("../services/util.service");
const { ucwords } = require("../helpers/basicFunc");



const addWorker = async (req, res, next) => {
  

    let newWorker = {
        name: ucwords(req.body.name),
        skills: req.body.skills,
    };

    [err, savedWorker] = await to(Worker.add(newWorker));
    if (err) return next(err);
    return ReS(res, savedWorker, 200, false, "Worker was successfully added");
}


// eligible workers based on skillsets
const getWorkersForTask = async (req, res, next)=>{

    [err, check_task] = await to(Task.getTask(req.params.task_id));
    if(err) return next(err);
    if(!check_task) return ReE(res,true,"Task does not exists", 404);

    [err,workers] = await to (Worker.getWorkersForTaskSkills(check_task.skills));
    if (err) return next(err);

    return ReS(res, workers);

}


const addWorkerToTask = async (req, res, next)=>{

    [err, check_task] = await to(Task.getTask(req.params.task_id));
    if(err) return next(err);
    if(!check_task) return ReE(res,true,"Task does not exists", 404);

    [err, check_worker] = await to(Worker.getWorker(req.body.worker_id));
    if(err) return next(err);
    if(!check_worker) return ReE(res,true,"Worker does not exists", 404);

    let completion_time = new Date();
    completion_time.setSeconds(completion_time.getSeconds()+check_task.time);

    let newTask = {
        task_id: new mongo.ObjectID(req.params.task_id),
        asset_id: new mongo.ObjectId(req.params.asset_id),
        time_of_allocation_raw: new Date(),
        time_of_allocation:new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'short', day: 'numeric' }) + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completion_by_time_raw:completion_time,
        completion_by_time:completion_time.toLocaleDateString("en-GB", { year: 'numeric', month: 'short', day: 'numeric' }) + " at " + completion_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    [err, addedTask] = await to(Worker.addTaskToWorker(req.body.worker_id,newTask));
    if(err) return next(err);
    
    return ReS(res,addedTask);
}

const getAllWorkers = async (req,res,next)=>{

    [err, allWorkers] = await to(Worker.getAll());
    if(err) return next(err);
    return ReS(res, allWorkers);
}

const getWorker = async (req,res,next)=>{

    [err, worker] = await to(Worker.getWorkerFull(req.params.worker_id));
    if(err) return next(err);
// console.log(worker)
    if(!worker){
        return ReE(res,false,"Worker not found",404)
    }
    if(!worker.tasks[0].asset_id){
        // console.log("hi")
     worker.tasks = [];
    }

    return ReS(res, worker);
}

module.exports = {
    addWorker,
    getWorkersForTask,
    addWorkerToTask,
    getAllWorkers,
    getWorker
}