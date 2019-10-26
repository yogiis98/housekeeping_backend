const CONFIG = require("../config/keys");
var mongo = require("mongodb");

const Task = require("../models/Task");
const Asset = require("../models/Asset");

const { to, ReE, ReS } = require("../services/util.service");
const { ucwords } = require("../helpers/basicFunc");



const addTask = async (req, res, next) => {
  
    [err, check_asset] = await to(Asset.getAsset(req.params.asset_id));
    if(err) return next(err);
    if(!check_asset) return ReE(res,true,"Asset Does not exists", 404);

    let newTask = {
        name: ucwords(req.body.name),
        asset_id: req.params.asset_id,
        description: req.body.description,
        skills: req.body.skills,
        time: req.body.time,
        is_active: true
    };

    [err, savedTask] = await to(Task.add(newTask));
    if (err) return next(err);
    return ReS(res, savedTask, 200, true, "Task successfully added");
}

const getTasks = async (req, res, next) => {
    [err, check_asset] = await to(Asset.getAsset(req.params.asset_id));
    if(err) return next(err);
    if(!check_asset) return ReE(res,true,"Asset Does not exists", 404);
    
    [err, allTasks] = await to(Task.getAll(req.params.asset_id));
    if(err) return next(err);
    return ReS(res, allTasks);

}

module.exports = {
    addTask,
    getTasks
}