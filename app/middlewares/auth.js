const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const logger = require('./../libs/loggerLib')
const response = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')
//models
const AuthModel = mongoose.model('Auth')

let isAuthorized = (req,res,next)=>{

    if(req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')){
        AuthModel.findOne({authToken:req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')},(err,authDetails)=>{
        
            if(err){
                console.log(err)
                logger.error(err.message,'authorization middleware',10)
                let apiResponse = response.generate(true,'failed to authorize',500,null)
                res.send(apiResponse)
            }else if(check.isEmpty(authDetails)){
                logger.error('authToken is empty','no authorization key is present',10)
                let apiResponse = response.generate(true,'invalid or expired authorization key',404,null)
                res.send(apiResponse)
            }else{
                token.verifyToken(authDetails.authToken,authDetails.tokenSecret,(err,decoded)=>{
                
                    if(err){
                        logger.error(err.message,'authorizationmiddleware',10)
                        let apiResponse = response.generate(true,'failed to authorize',500,null)
                        res.send(apiResponse)
                    }else{
                        req.user = {userId:decoded.data.userId}
                        next()
                    }
                });
            }
        });
    }else{
        logger.error('authToken is missing','authorizationmiddleware',10)
        let apiResponse = response.generate(true,'authtoken is missing in request',400,null)
        res.send(apiResponse)
    }
}

module.exports = {
    isAuthorized : isAuthorized
}