'use strict'
const logger = require('pino')()
const moment = require('moment')

//this is a function definition of how errors will throw in our system

let captureError = (errorMessage,errorOrigin,errorLevel)=>{
    let currentTime = moment()
    let errorResponse = {
        timeStamp:currentTime,
        errorMessage:errorMessage,
        errorOrigin:errorOrigin,
        errorLevel:errorLevel
    }
    logger.error(errorResponse)
    return errorResponse
}

let captureInfo = (message,origin,impLevel)=>{
    let currentTime = moment()
    let infoMessage = {
        timeStamp:currentTime,
        message:message,
        origin:origin,
        level:impLevel
    }
    logger.info(infoMessage)
    return infoMessage
}

module.exports = {
    error:captureError,
    info: captureInfo
}