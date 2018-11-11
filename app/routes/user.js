const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const appConfig = require('./../../config/appConfig');
const auth = require('./../middlewares/auth');

module.exports.setRouter =(app)=>{
    
    let baseUrl = `${appConfig.apiVersion}/user`;

    app.post(`${baseUrl}/signup`,userController.signup);
    /**
        * @apiGroup users
        * @apiVersion  1.0.0
        * @api {post} /api/v1/user/signup For signup.
        *
        * @apiParam {string} email email of the user. (body params) (required)
        * @apiParam {string} password password of the user. (body params) (required)
        * @apiParam {string} firstName First Name of the user. (body params) (required)
        * @apiParam {string} lastName Last Name of the user. (body params) (required)
        * @apiParam {string} mobileNumber Mobile Number of the user. (body params) (required)
        *
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
           {
               "error": false,
               "message": "User created",
               "status": 200,
               "data": {
                    "userId": "Kgsf4jgzX",
                    "firstName": "some",
                    "lastName": "name",
                    "email": "somemail@gmail.com",
                    "mobileNumber": 9848022338,
                    "createdOn": "2018-09-05T05:05:37.000Z",
                   "_id": "5b9680f00efbde2414a8e39d",
                   "__v": 0
               }
           }
        *  @apiErrorExample {json} Error-Response:
        *
        * {
               "error": true,
               "message": string,
               "status": number,
               "data": any
           }      
       */


    app.post(`${baseUrl}/activate`, userController.activateUser);
      /**
    * @apiGroup User
    * @apiVersion  1.0.0
    * @api {post} /api/v1/users/activate User Activate.
    *
    * @apiParam {string} activateToken activateToken of the user. (body params) (required)
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Your account is successfully activated",
           "status": 200,
           "data": {
               "n": 1,
               "nModified": 1,
               "ok": 1
               }
           }
       }
       @apiErrorExample {json} Error-Response:
    *
    * {
       "error": true,
       "message": "Failed to activate the user",
       "status": 500,
       "data": null
      }
   */
    app.post(`${baseUrl}/login`,userController.login);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/user/login  user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    app.get(`${baseUrl}/allusers`,auth.isAuthorized,userController.getAllUsers);

    app.get(`${baseUrl}/:userId/details`,auth.isAuthorized,userController.getUserById);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {get} /api/v1/user/:userId/details api get user details.
         *
         * @apiParam {string} userId userId of the user. (query params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
         {
                "error": false,
                "message": "User Details Found",
                "status": 200,
                "data": {
                    "userId": "Kgsf4jgzX",
                    "firstName": "some",
                    "lastName": "name",
                    "email": "somemail@gmail.com",
                    "mobileNumber": 9848022338,
                    "createdOn": "2018-09-05T05:05:37.000Z"
                }
            }
         *  @apiErrorExample {json} Error-Response:
         *
         * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }      
        */

    app.post(`${baseUrl}/:userId/delete`,auth.isAuthorized,userController.deleteUser);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/user/:userId/delete Delete user.
         *
         * @apiParam {string} userId userId of the user. (query params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
         {
                "error": false,
                "message": "User deleted successfully",
                "status": 200,
                "data": {
                    "userId": "Kgsf4jgzX",
                    "firstName": "some",
                    "lastName": "name",
                    "email": "somemail@gmail.com",
                    "mobileNumber": 9848022338,
                    "createdOn": "2018-09-05T05:05:37.000Z"
                }
            }
         *  @apiErrorExample {json} Error-Response:
         *
         * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }      
        */

    app.put(`${baseUrl}/:userId/edit`,auth.isAuthorized,userController.editUser);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {putt} /api/v1/user/:userId/edit Edit user details.
         *
         * @apiParam {string} userId userId of the user. (query params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
         {
                "error": false,
                "message": "User edited successfully",
                "status": 200,
                "data": {
                    "userId": "Kgsf4jgzX",
                    "firstName": "some",
                    "lastName": "name",
                    "email": "somemail@gmail.com",
                    "mobileNumber": 9848022338,
                    "createdOn": "2018-09-05T05:05:37.000Z"
                }
            }
         *  @apiErrorExample {json} Error-Response:
         *
         * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }      
        */


    app.post(`${baseUrl}/logout`,auth.isAuthorized,userController.logout);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/user/:userId/logout logout user.
         *
         * @apiParam {string} userId userId of the user. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
            {
                "error": false,
                "message": "Logged Out Successfully",
                "status": 200,
                "data": null
            }
          *  @apiErrorExample {json} Error-Response:
          *
          * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }
     */

    app.get(`${baseUrl}/:email/forgotpassword`,userController.forgotpassword);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {get} /api/v1/user/:email/forgotPassword Forgot password to send reset email to user.
         *
         * @apiParam {string} userEmail Email of the user. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "User Details Found",
                    "status": 200,
                    "data": "Mail sent successfully"
                }
        *  @apiErrorExample {json} Error-Response:
        *
        *  {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }        
        */

    
    app.post(`${baseUrl}/resetPassword`,userController.resetPassword);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/user/resetPassword To change password of user.
         *
         * @apiParam {string} userId Id of the user. (body params) (required)
         * @apiParam {string} password New password of the user. (body params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "Mail sent Successfully",
                    "status": 200,
                    "data": "Password reset successfull."
                }
        *  @apiErrorExample {json} Error-Response:
        *
        *  {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }        
        */

}