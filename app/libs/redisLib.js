const check = require('./checkLib')
const redis = require('redis')

let client = redis.createClient({
    url: 'redis://redis-12431.c12.us-east-1-4.ec2.cloud.redislabs.com:12431'
});
client.auth("8R5VW9RPNRpBge93l5FvwHHLsWDkynGK");


client.on('connect',()=>{
    console.log('Redis Connection opened successfully')

})

let getAllUsersInHash = (hashName,cb)=>{
    client.HGETALL(hashName,(err,result)=>{
        if(err){
            console.log(err)
            cb(err,null)
        }else if(check.isEmpty(result)){
            console.log('online user list is empty')
            console.log(result)
            cb(err,{})
        }else{
            console.log(result)
            cb(null,result)
        }
    })
}

let setNewOLUserInHash = (hashName,key,value,cb)=>{
    client.HMSET(hashName,[key,value],(err,result)=>{
        if(err){
            console.log(err)
            cb(err,null)
        } else {
            console.log('user has been set in the hash map')
            console.log(result)
            cb(null,result)
        }        
    })
}

let deleteUserFromHash = (hashName,key)=>{
    client.HDEL(hashName,key)
    return true
}

//for offline users
let getAllOfflineUsersInHash = (hashName,cb)=>{
    client.HGETALL(hashName,(err,result)=>{
        if(err){
            console.log(err)
            cb(err,null)
        }else if(check.isEmpty(result)){
            console.log('online user list is empty')
            console.log(result)
            cb(err,{})
        }else{
            console.log(result)
            cb(null,result)
        }
    })
}

let setNewOfflineUserInHash = (hashName,key,value,cb)=>{
    client.HMSET(hashName,[key,value],(err,result)=>{
        if(err){
            console.log(err)
            cb(err,null)
        } else {
            console.log('user has been set in the hash map')
            console.log(result)
            cb(null,result)
        }        
    })
}

let deleteOfflineUserFromHash = (hashName,key)=>{
    client.HDEL(hashName,key)
    return true
}

module.exports = {
    getAllUsersInHash:getAllUsersInHash,
    setNewOLUserInHash:setNewOLUserInHash,
    deleteUserFromHash:deleteUserFromHash,
    getAllOfflineUsersInHash:getAllOfflineUsersInHash,
    setNewOfflineUserInHash:setNewOfflineUserInHash,
    deleteOfflineUserFromHash:deleteOfflineUserFromHash
}