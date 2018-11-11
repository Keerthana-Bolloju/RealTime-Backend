const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const secretKey = 'IamARareVampireThatNoOneCanGuess';

let generateToken = (data,cb)=>{
    try{
        let claims = {
            jwtid:shortid.generate(),
            iat:Date.now(),
            exp:Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            sub:'authToken',
            iss:'pingChat',
            data:data
        }
        let tokenDetails = {
            token:jwt.sign(claims,secretKey),
            tokenSecret:secretKey
        }
        cb(null,tokenDetails)
    }
    catch(err){
        console.log(err)
        cb(err,null)
    }
}

verifyToken = (token,secretKey,cb)=>{
    jwt.verify(token,secretKey,function(err,decoded){
        if(err){
            console.log(err)
            console.log('error occured while token verificationn')
            cb(err,null)
        }else{
            console.log(decoded)
            console.log('user verified success')
            cb(null,decoded)
        }
    })
}


verifyClaimsWithOutSecret = (token,cb)=>{
    jwt.verify(token,secretKey,function(err,decoded){
        if(err){
            console.log(err)
            console.log('error occured while token verificationn')
            cb(err,null)
        }else{
            console.log(decoded)
            console.log('user verified success')
            cb(null,decoded)
        }
    })
}

module.exports = {
    generateToken:generateToken,
    verifyToken:verifyToken,
    verifyClaimsWithOutSecret:verifyClaimsWithOutSecret
}