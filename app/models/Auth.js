const mongoose = require('mongoose')
const time = require('./../libs/timeLilb')

const Schema = mongoose.Schema

let AuthModel = new Schema({
    userId:{
        type:String
    },
    authToken:{
        type:String
    },
    tokenSecret:{
        type:String
    },
    tokenGenerationTime:{
        type:Date,
        default:time.now()
    }
})


mongoose.model('Auth',AuthModel)