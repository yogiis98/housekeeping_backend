const Validator = require('validator');
const isEmpty = require('./is-empty');
const { ReS, ReE, to, TE } = require('../services/util.service');
var mongo = require("mongodb");

const validateAssetInsert = (req, res, next) => {
    req.body.name = !isEmpty(req.body.name) ? req.body.name + "" : "";
    req.body.image = !isEmpty(req.body.image) ? req.body.image + "" : "";

    req.body.name = Validator.trim(req.body.name);
    req.body.image = Validator.trim(req.body.image);

    if(Validator.isEmpty(req.body.name) || !Validator.isAscii(req.body.name) || Validator.isEmpty(req.body.image) || !Validator.isURL(req.body.image)){
        return ReE(res, true, "Please Fill data properly.", 400)
    }

    next();
};

module.exports = {
    validateAssetInsert
}