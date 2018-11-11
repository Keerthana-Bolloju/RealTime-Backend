const bcrypt = require('bcrypt-nodejs')
let saltRounds = 10
const logger = require('../libs/loggerLib')

let hashPassword = (myPlainPassword)=>{
    let salt = bcrypt.genSaltSync(saltRounds)
    let hash = bcrypt.hashSync(myPlainPassword,salt)//making myplainpassword to encrypt using salts 
    return hash
}

let comparePassword = (oldPassword,hashPassword,cb)=>{
//oldPassword is data to compare and hashpassword is data to be compared to and here (err,res) is callback function
    bcrypt.compare(oldPassword,hashPassword,(err,res)=>{
        if(err){
            logger.error(err.message,'comparision error in password',5)
            cb(err,null)
        }else{
            cb(null,res)
        }
    })
}

let comparePasswordSync = (myPlainPassword,hash)=>{
//myplainpassword is data to compare and hash is data to be compared    
    return bcrypt.compareSync(myPlainPassword,hash)
}

module.exports = {
    hashPassword:hashPassword,
    comparePassword:comparePassword,
    comparePasswordSync:comparePasswordSync
}