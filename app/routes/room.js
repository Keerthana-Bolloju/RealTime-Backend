const express = require('express');
const router = express.Router();
const chatRoomController = require('./../controllers/roomController');
const appConfig = require('./../../config/appConfig');
const auth = require('./../middlewares/auth');

module.exports.setRouter =(app)=>{

    let baseUrl = `${appConfig.apiVersion}/chatroom`;

    app.get(`${baseUrl}/view/all/rooms`, auth.isAuthorized, chatRoomController.getAllTheRooms);
    /**
     * @apiGroup CHAT ROOM
     * @apiVersion  1.0.0
     * @api {get} /api/v1/chatroom/view/all/rooms api for Getting Details of all Chat Rooms which are avaiable.
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "All Room Details Found",
            "status": 200,
            "data": [
                {
                    "chatRoomId": "EVjxELO6",
                    "modifiedOn": "2018-07-22T16:56:51.076Z",
                    "createdOn": "2018-07-22T16:56:51.000Z",
                    "activeUsers": [
                        {
                            "user": "Keerthi Gana",
                            "id": "Kgsf4jgzX"
                        }
                    ],
                    "active": "No",
                    "userId": "Kgsf4jgzX",
                    "userName": "Keerthi Gana",
                    "chatRoomLink": "http://localhost:4200/chatroom/join/EVjxELO6",
                    "chatRoomTitle": "Test"
                }
            ]
        }
    */


    // params: userId.
    app.get(`${baseUrl}/view/all/joined/rooms/:userId`, auth.isAuthorized, chatRoomController.getAllTheJoinedRooms);
    /**
     * @apiGroup CHAT ROOM
     * @apiVersion  1.0.0
     * @api {get} /api/v1/chatroom/view/all/joined/rooms/:userId api for Getting Details of Chat Room which User is already Joined.
     *
     * @apiParam {string} userId Id of of the User. (query params) (required)
     *	
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "All Room Details Found",
            "status": 200,
            "data": [
                {
                    "chatRoomId": "EVjxELO6",
                    "modifiedOn": "2018-07-22T16:56:51.076Z",
                    "createdOn": "2018-07-22T16:56:51.000Z",
                    "activeUsers": [
                        {
                            "user": "Keerthi Gana",
                            "id": "Kgsf4jgzX"
                        }
                    ],
                    "active": "No",
                    "userId": "Kgsf4jgzX",
                    "userName": "Keerthi Gana",
                    "chatRoomLink": "http://localhost:4200/chatroom/join/EVjxELO6",
                    "chatRoomTitle": "Test"
                }
            ]
        }
    */


    // params: chatRoomId.
    app.get(`${baseUrl}/view/allRoomsAvailableToJoin/:userId`, auth.isAuthorized, chatRoomController.getAllRoomsAvailableToJoin);
    /**
     * @apiGroup CHAT ROOM
     * @apiVersion  1.0.0
     * @api {get} /api/v1/chatroom/view/allRoomsAvailableToJoin/:userId api for Getting Details of Chat Room which User can Join.
     *
     * @apiParam {string} chatRoomId Id of Chat Room. (query params) (required)
     *	
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "All Room Details Found",
            "status": 200,
            "data": [
                {
                    "chatRoomId": "EVjxELO6",
                    "modifiedOn": "2018-07-22T16:56:51.076Z",
                    "createdOn": "2018-07-22T16:56:51.000Z",
                    "activeUsers": [
                        {
                            "user": "Keerthi Gana",
                            "id": "Kgsf4jgzX"
                        }
                    ],
                    "active": "No",
                    "userId": "Kgsf4jgzX",
                    "userName": "Keerthi Gana",
                    "chatRoomLink": "http://localhost:4200/chatroom/join/EVjxELO6",
                    "chatRoomTitle": "Test"
                }
            ]
        }
    */


    // params: chatRoomId.
    app.get(`${baseUrl}/room/details/:chatRoomId`, auth.isAuthorized, chatRoomController.getSingleRoom);
    /**
     * @apiGroup CHAT ROOM
     * @apiVersion  1.0.0
     * @api {get} /api/v1/chatroom/room/details/:chatRoomId api for Getting Details of Chat Room.
     *
     * @apiParam {string} chatRoomId Id of Chat Room. (query params) (required)
     *	
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Room Details Found",
            "status": 200,
            "data": {
                    "chatRoomId": "EVjxELO6",
                    "modifiedOn": "2018-07-22T16:56:51.076Z",
                    "createdOn": "2018-07-22T16:56:51.000Z",
                    "activeUsers": [
                        {
                            "user": "Keerthi Gana",
                            "id": "Kgsf4jgzX"
                        }
                    ],
                    "active": "No",
                    "userId": "Kgsf4jgzX",
                    "userName": "Keerthi Gana",
                    "chatRoomLink": "http://localhost:4200/chatroom/join/EVjxELO6",
                    "chatRoomTitle": "Test"
                }
        }
    */



    // params: chatRoomId.
    app.put(`${baseUrl}/edit/room`, auth.isAuthorized, chatRoomController.editARoom);
    /**
     * @apiGroup CHAT ROOM
     * @apiVersion  1.0.0
     * @api {put} /api/v1/chatroom/edit/room api for Updating Chat Room.
     *
     * @apiParam {string} chatRoomId Id of Chat Room. (body params) (required)
     * @apiParam {string} chatRoomTitle Title of Chat Room. (body params) (required)
     *	
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Chat Room details Updated",
            "status": 200,
            "data": {
                "n": 1,
                "nModified": 1,
                "ok": 1
            }
        }
    */


    // params: chatRoomId.
    app.post(`${baseUrl}/delete/room`, auth.isAuthorized, chatRoomController.deleteARoom);
    /**
     * @apiGroup CHAT ROOM
     * @apiVersion  1.0.0
     * @api {post} /api/v1/chatroom/delete/room api for deleting Chat Room.
     *
     * @apiParam {string} chatRoomId Id of Chat Room. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Deleted the room successfully",
            "status": 200,
            "data":  {
                    "_id": "5b54b7534d4ab016ec8c7a4f",
                    "chatRoomId": "EVjxELO6",
                    "modifiedOn": "2018-07-22T16:56:51.076Z",
                    "createdOn": "2018-07-22T16:56:51.000Z",
                    "activeUsers": [
                        {
                            "user": "Keerthi Gana",
                            "id": "Kgsf4jgzX"
                        }
                    ],
                    "active": "No",
                    "userId": "Kgsf4jgzX",
                    "userName": "Keerthi Gana",
                    "chatRoomLink": "http://localhost:4200/chatroom/join/EVjxELO6",
                    "chatRoomTitle": "Test"
                }
            
        }
     * @apiSuccessExample {object} Failure-Response:
        {
        	"error": true,
	        "message": "No Room Found or User Not an Admin",
        	"status": 404,
        	"data": null
        }
    */

}