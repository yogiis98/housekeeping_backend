const {to} = require('await-to-js');
const pe = require('parse-error');

module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if(err) return [err];
    return [null, res];
};

// Error Web Response
module.exports.ReE = function(res, alert=false, err="Some error occured", code=400, data={}){ 
    if(typeof err == 'object' && typeof err.message != 'undefined'){
        err = err.message;
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json({success:false, code:code, alert:alert, message: err, data:data});
};

// Success Web Response
module.exports.ReS = function(res, data={}, code=200,alert=false,message=""){ 
    if(typeof code !== 'undefined') res.statusCode = code;
    return res.json({success:true, code:code, alert:alert, message: message, data:data})
};

// TE stands for Throw Error
module.exports.TE = TE = function(err_message, err_code, log=false){ 
    if(log === true){
        console.error(err_message);
    }
    throw new Error(err_message);
};
    
