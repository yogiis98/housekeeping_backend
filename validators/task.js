const Validator = require('validator');
const isEmpty = require('./is-empty');
const { ReS,ReE,to,TE } = require('../services/util.service');
var mongo = require("mongodb");

const validateTaskInsert = (req, res, next) => {

    if(!Validator.isMongoId(req.params.asset_id)){
        return ReE(res, true, "Proper asset id isn't provided", 400)
    }

    req.body.name = !isEmpty(req.body.name) ? req.body.name + "" : "";
    req.body.description = !isEmpty(req.body.description) ? req.body.description + "" : "";
    req.body.time = !isEmpty(req.body.time) ? req.body.time + "" : "";

    if (Validator.isEmpty(req.body.name) || !Validator.isAscii(req.body.name) || Validator.isEmpty(req.body.description) || !Validator.isAscii(req.body.description) || Validator.isEmpty(req.body.time) || !Validator.isNumeric(req.body.time) || (parseInt(req.body.time) < 0)) {
        return ReE(res, true, "Please fill in valid data", 400)
    }


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

        req.body.time = parseInt(req.body.time);

    next();
};


const validateGetTask = (req, res, next) => {
    if(!Validator.isMongoId(req.params.asset_id)){
        return ReE(res, true, "Proper asset id isn't provided", 400)
    }
    next();
}


module.exports = {
    validateTaskInsert,
    validateGetTask
}