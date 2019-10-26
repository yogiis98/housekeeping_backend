const Validator = require('validator');
const isEmpty = require('./is-empty');
const {
    ReS,
    ReE,
    to,
    TE
} = require('../services/util.service');
var mongo = require("mongodb");

const validateWorkerInsert = (req, res, next) => {
    req.body.name = !isEmpty(req.body.name) ? req.body.name + "" : "";


    if (req.body.skills instanceof Array) {
        let error = false;
        req.body.skills.map((skill, index) => {
            skill = skill + "";
            req.body.skills[index] = Validator.trim(req.body.skills[index]);
            if (Validator.isEmpty(skill) || !Validator.isAscii(skill)) {
                error = true;
            }
        });
        if (error) {
            return ReE(res, true, "Please fill in valid data", 400);
        }
    } else {
        return ReE(res, true, "Please fill in valid data", 400);
    }

    if (Validator.isEmpty(req.body.name) || !Validator.isAscii(req.body.name)) {
        return ReE(res, true, "Please fill in valid data", 400);
    }
    next();
}

const validateWorkerforTask = (req, res, next) => {
    if(!Validator.isMongoId(req.params.task_id)){
        return ReE(res, true, "Proper task id isn't provided", 400)
    }
    next();
}

const validateAddTaskToWorker = (req, res, next) => {
    if(!Validator.isMongoId(req.params.asset_id)){
        return ReE(res, true, "Proper asset id isn't provided", 400)
    }

    if(!Validator.isMongoId(req.params.task_id)){
        return ReE(res, true, "Proper task id isn't provided", 400)
    }

    if(!Validator.isMongoId(req.body.worker_id)){
        return ReE(res, true, "Please fill in valid data", 400)
    }

    next();
}

const validateWorkerTaskDetail = (req, res, next) => {
    if(!Validator.isMongoId(req.params.worker_id)){
        return ReE(res, true, "Proper worker id isn't provided", 400)
    }
    next();
}

module.exports = {
    validateWorkerInsert,
    validateWorkerforTask,
    validateAddTaskToWorker,
    validateWorkerTaskDetail
}