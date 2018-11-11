const response = require('./../libs/responseLib')

let errorHandler = (err,req,res,next)=>{
    console.log('application error handler called')
    console.log(err)
    let apiResponse = response.generate(true,'some error occured at global level',500,null)
    res.send(apiResponse)
}//end req ip logger function

let notFoundHandler = (req,res,next)=>{
    console.log('global not found handler called')
    let apiResponse = response.generate(true,'Route Not found in the application',404,null)
    res.status(404).send(apiResponse)
}

module.exports = {
    globalErrorHandler: errorHandler,
    globalNotFoundHandler: notFoundHandler
}