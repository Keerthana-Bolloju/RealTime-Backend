//it includes login and signup functions
const mongoose = require('mongoose')
const time = require('./../libs/timeLilb')
const passwordLib = require('./../libs/generatePasswordLib')
const validateInput = require('./../libs/paramsValidationLib')
const logger = require('./../libs/loggerLib')
const response = require('./../libs/responseLib')
const check = require('./../libs/checkLib')
const token = require('./../libs/tokenLib')
const shortid = require('shortid')
const mailerLib = require('./../libs/mailerLib')
const uuid = require('uuid')
//importing models
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')

//signUp function it includes input validation create user and save user
let signUp = (req, res) => {
    //validating input
    let inputValidation = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'email doesnt meet the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'password parameter is missing', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('field missed during creation', 'userController:createUser()', 5)
                let apiResponse = response.generate(true, 'one or more parameters are missing', 400, null)
                reject(apiResponse)
            }
        });
    }//end inputValidation

    //create User
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, getUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController:createUser', 10)
                        let apiResponse = response.generate(true, 'failed to create user', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(getUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            mobile: req.body.mobile,
                            email: req.body.email.toLowerCase(),
                            password: passwordLib.hashPassword(req.body.password),
                            activateUserToken: uuid.v4(),
                            createdOn: time.now()
                        });

                        //save the user
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController:createUser', 10)
                                let apiResponse = response.generate(true, 'failed to save new user', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject()
                                resolve(newUserObj)
                            }
                        });//end save user

                    } else {
                        logger.error('User already present with this email', 'userController:createUser', 10)
                        let apiResponse = response.generate(true, 'user already exists with this email', 403, null)
                        reject(apiResponse)
                    }
                });
        });
    }//end create user

    inputValidation(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
}//end signUp function

//login function
let login = (req, res) => {
    //finding user in database
    let findUser = () => {
        console.log('find user')
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log('req.body.email is there in the database')
                console.log(req.body)
                UserModel.findOne({ email: req.body.email }, (err, userdetails) => {

                    //handling error if user is not found
                    if (err) {
                        logger.error(err.message, 'userController:findUser()', 10)
                        let apiResponse = response.generate(true, 'failed to find user details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userdetails)) {
                        let apiResponse = response.generate(true, 'no user details found', 500, null)
                        reject(apiResponse)
                    } else {
                        logger.info('user found', 'user details found', 10)
                        resolve(userdetails)
                    }
                })
            } else {
                let apiResponse = response.generate(true, 'email parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }//end find user

    //validating password
    let passwordValidation = (foundUserDetails) => {
        console.log('validating password')
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, foundUserDetails.password, (err, isMatch) => {

                if (err) {
                    logger.error(err.message, 'UserController:passwordValidation', 10)
                    let apiResponse = response.generate(true, 'Login failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let getUserDetailsFound = foundUserDetails.toObject()
                    delete getUserDetailsFound.password
                    delete getUserDetailsFound._id
                    delete getUserDetailsFound.__v
                    delete getUserDetailsFound.createdOn
                    resolve(getUserDetailsFound)
                } else {
                    let apiResponse = response.generate(true, 'password doesnt match,Login failed', 404, null)
                    reject(apiResponse)
                }
            })
        });
    }//end validating password

    //token generation
    let generateToken = (userdetails) => {
        console.log('token generation')
        return new Promise((resolve, reject) => {
            token.generateToken(userdetails, (err, tokenDetails) => {

                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'failed to generate token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userdetails.userId,
                        tokenDetails.userdetails = userdetails
                    resolve(tokenDetails)
                }
            });
        });
    }//end token generation

    //code for saving generated token, if already generated then updating the token when expired
    let saveToken = (tokenDetails) => {
        console.log('saving token')
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, authTokenDetailsFound) => {

                if (err) {
                    logger.error(err.message, 'userController:saveToken', 10)
                    let apiResponse = response.generate(true, 'failed to save generated token', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(authTokenDetailsFound)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newAuthTokenDetails) => {
                        if (err) {
                            logger.error(err.message, 'userController:saveToken', 10)
                            let apiResponse = response.generate(true, 'failed to save token details', 400, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newAuthTokenDetails.authToken,
                                userdetails: tokenDetails.userdetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    authTokenDetailsFound.authToken = tokenDetails.token,
                        authTokenDetailsFound.tokenSecret = tokenDetails.tokenSecret,
                        authTokenDetailsFound.tokenGenerationTime = time.now()
                    authTokenDetailsFound.save((err, newAuthTokenDetails) => {
                        if (err) {
                            logger.error(err.message, 'userController:saveToken', 10)
                            let apiResponse = response.generate(true, 'failed to save token details', 400, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newAuthTokenDetails.authToken,
                                userdetails: tokenDetails.userdetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        });
    }
    //calling functions
    findUser(req, res)
        .then(passwordValidation)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successfull', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err)
            res.send(err)
        })

}//end login function


//function to get all users
let getAllUsers = (req, res) => {
    console.log('get all users function')
    UserModel.find()
        .select('-_id -__v -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'userController:getAllUsers', 10)
                let apiResponse = response.generate(true, 'failed to find users', 400, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.error('no user found', 'userController:getAllUsers', 10)
                let apiResponse = response.generate(true, 'No user found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details found', 200, result)
                res.send(apiResponse)
            }
        })
}// end getAllUsers


//function to getUserById
let getUserById = (req, res) => {
    console.log('get user by userId')
    UserModel.findOne({ 'userId': req.params.userId })
        .select('-_id -__v -password')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'userController:getUserById', 10)
                let apiResponse = response.generate(true, 'failed to find user by id', 400, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.error('no user found with this id', 'userController:getUserById', 10)
                let apiResponse = response.generate(true, 'No user found with this id', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User found with this Id', 200, result)
                res.send(apiResponse)
            }
        })
}// end getUserByid 

//function to deleteUser
let deleteUser = (req, res) => {
    let findUser = () => {

        return new Promise((resolve, reject) => {
            if (req.params.userId) {
                UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                    /* handle the error if the user is not found */
                    if (err) {
                        logger.error('Failed to retrieve user Data', "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    }/* if company details is not found */
                    else if (check.isEmpty(userDetails)) {
                        logger.error("No User Found", "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("user found", "userController: findUser()", 10);
                        resolve(userDetails);
                    }
                });
            }
            else {
                let apiResponse = response.generate(true, "UserId parameter is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findUser()

    let deleteAUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOneAndRemove({ userId: req.params.userId }, (err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'user Controller: deleteUser', 10)
                    let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    let apiResponse = response.generate(true, 'Already deleted or Invalid UserId', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Account deleted Successfully', 200, result)
                    resolve(apiResponse)
                }
            })
        });
    }// end of deleteUser 


    findUser(req, res)
        .then(deleteAUser)
        .then((result) => {
            let apiResponse = response.generate(false, 'Account deletion Successful', 200, result)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}//end deleteUser

//function to edituser
let editUser = (req, res) => {

    let options = req.body;
    UserModel.update({ 'userId': req.params.userId }, options, { multi: true }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller:editUser', 10)
            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details edited', 200, result)
            res.send(apiResponse)
        }
    });// end user model update


}// end edit user

//function to logout
let logout = (req, res) => {
    console.log('Logged out successfully')
    AuthModel.findOneAndRemove({ userId: req.user.userId })
        .select('-_id -__v')
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'userController:logout', 10)
                let apiResponse = response.generate(true, `error occured:${err.message}`, 400, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'invalid input or user already logged out', 400, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'user logged out successfully', 200, result)
                delete result._id
                delete result.tokenSecret
                delete result.authToken
                res.send(apiResponse)
            }
        })
}//end logout


//function for activate user
let activateUser = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.activateToken)) {
                let apiResponse = response.generate(true, 'activateToken parameter is missing', 400, null)
                reject(apiResponse)
            } else {
                resolve()
            }
        })
    }
    let activateUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.update({ activateUserToken: req.body.activateToken }, { $unset: { activateUserToken: 1 }, active: true }, (err, result) => {
                if (err) {
                    console.log(err)
                    logger.error('Failed to Retrieve User Data', 'User Controller : activateUser', 5)
                    let apiResponse = response.generate(true, 'Failed to activate the user', 400, null)
                    reject(apiResponse)
                } else if (result.n === 0) {
                    logger.error('No User Found', 'User Controller : activateUser', 5)
                    let apiResponse = response.generate(true, 'No User Details Found', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(result)
                }
            })
        })
    }
    validateUserInput(req, res)
        .then(activateUser)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Your account is successfully activated', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            res.send(err)
        })
}
//end activate account





//function for forgot password
let forgotPassword = (req, res) => {
    //sending a forgot password link to email to reset the password
    if (check.isEmpty(req.params.email)) {
        logger.error('email parameter is missing', 'userCOntroller:forgotPassword', 10)
        let apiResponse = response.generate(true, 'email parameter is missing', 400, null)
        response.send(apiResponse)
    } else {
        UserModel.findOne({ email: req.params.email }, (err, result) => {
            if (err) {
                logger.error('failed to find email', 'userController:forgotpassword', 10)
                let apiResponse = response.generate(true, 'failed to find user with this email', 400, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.error('No user found', 'userController:forgotpassword', 10)
                let apiResponse = response.generate(true, 'no user found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info('User Found', 'userController:forgotPassword', 10)
                mailerLib.autoGenEmail(req.params.email, `Hello <b>${result.firstName} ${result.lastName}</b>!!<br><br>Welcome to ping-Youu.<br>Click here to reset your password <a href='http://ping-you.xyz/resetPassword/${result.userId}'>Click Here</a> .<br><br>For any Query, drop us a mail at- ping.youu@gmail.com<br><br>Regards<br>Ping-Youu `)
                let apiResponse = response.generate(false, 'user found with this email', 200, 'Mail sent successfully')
                res.send(apiResponse)
            }
        })
    }
}//end forgot password



//function for reset password
let resetPassword = (req, res) => {
    //find user
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.userId) {
                UserModel.findOne({ userId: req.body.userId }, (err, userDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve user Data', "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    }/* if company details is not found */
                    else if (check.isEmpty(userDetails)) {
                        logger.error("No User Found", "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("user found", "userController: findUser()", 10);
                        resolve(userDetails);
                    }
                });
            } else {
                let apiResponse = response.generate(true, 'missing parameters', 400, null)
                reject(apiResponse)
            }
        })
    }//end findUser

    //function for saveUpdatedPassword
    let saveUpdatePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.password)) {
                logger.error('password is missing', 'userController:logout', 10)
                let apiResponse = response.generate(true, 'password is missing', 400, null)
                reject(apiResponse)
            } else {
                UserModel.update({ userId: req.body.userId }, { password: passwordLib.hashPassword(req.body.password) }, { multi: true }, (err, result) => {
                    if (err) {
                        logger.error("Failed to change Password ", "userController: resetPassword", 10);
                        let apiResponse = response.generate(true, "Failed to change Password", 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(result)) {
                        logger.error("User Not found", "userController: resetPassword", 10);
                        let apiResponse = response.generate(true, "User not found", 500, null);
                        reject(apiResponse);
                    } else {
                        logger.info('password updated and saved', 'userController:resetPassword', 10)
                        mailerLib.autoGenEmail(userDetails.email,`<b> Hi ${userDetails.firstName} ${userDetails.lastName},<br><br> Your password has been changed succesfully.</b><br><br>For any Query, drop us a mail at- ping.youu@gmail.com<br><br>Regards<br>Ping-Youu`)
                        resolve('Password Reset and updated Successful')
                    }
                });
            }
        });
    }//end saveUpdatePassword

    //calling functions
    findUser(req, res)
        .then(saveUpdatePassword)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'password updated successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err)
            res.send(err)
        })
}

module.exports = {
    signup: signUp,
    login: login,
    getAllUsers: getAllUsers,
    getUserById: getUserById,
    deleteUser: deleteUser,
    editUser: editUser,
    logout: logout,
    forgotpassword: forgotPassword,
    resetPassword: resetPassword,
    activateUser:activateUser
}
