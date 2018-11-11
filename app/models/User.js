'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userShema = new Schema({
    userId:{
        type:String,
        index:true,
        required:true,
        unique:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        min:1111111111,
        max:9999999999,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    createdOn:{
        type:Date,
        default:Date.now()
    },
    active:{
        type:Boolean,
        default:false
    },
    activeUserToken:{
        type:String
    }
})

mongoose.model('User',userShema)