const CONFIG = require("../config/keys");

const Asset = require("../models/Asset");

const { to, ReE, ReS } = require("../services/util.service");
const { ucwords } = require("../helpers/basicFunc");

const addAsset = async (req, res, next) => {

    
    let newAsset = {
        name: ucwords(req.body.name),
        image: req.body.image,
        is_active: true,
    };

    [err, savedAsset] =  await to(Asset.add(newAsset));
    if (err) return next(err);
    return ReS(res, savedAsset, 200, true, "Asset added successfully");

}

const getAssets = async (req,res,next)=>{

    [err,assets] = await to(Asset.getAll());
    
    if(err) return next(err);

    return ReS(res,assets);

}


module.exports = {
    addAsset,
    getAssets
}