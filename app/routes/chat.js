const express = require('express');
const router = express.Router();
const chatController = require('./../controllers/chatController');
const appConfig = require('./../../config/appConfig');
const auth = require('./../middlewares/auth');

module.exports.setRouter =(app)=>{

    let baseUrl = `${appConfig.apiVersion}/chat`
    
    app.get(`${baseUrl}/getUsersChat`,auth.isAuthorized,chatController.getUsersChat);
    /**
     * @apiGroup CHAT
     * @apiVersion  1.0.0
     * @api {get} /api/v1/chat/getUsersChat to get paginated chats of user.
     * 
     * @apiParam {string} senderId userId of logged in user. (query params) (required)
     * @apiParam {string} receiverId userId receiving user. (query params) (required)
     * @apiParam {number} skip skip value for pagination. (query params) (optional)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
          "error": false,
          "message": "All Chats Listed",
          "status": 200,
          "data": [
            {
              "chatId": "EVjxELO6",
              "modifiedOn": "2018-03-05T15:36:31.026Z",
              "createdOn": "2018-03-05T15:36:31.025Z",
              "message": "hello .. ..",
              "receiverId": "ieTVTYA8",
              "receiverName": "Keerthi Gana",
              "senderId": "-iYj5cA7k",
              "senderName": "some Name"
            },
            {
              "chatId": "-iYj5cA7k",
              "modifiedOn": "2018-03-05T15:36:39.548Z",
              "createdOn": "2018-03-05T15:36:39.547Z",
              "message": "hello  .. .. .. ",
              "receiverId": "EVjxELO6",
              "receiverName": "some Name",
              "senderId": "ieTVTYA8",
              "senderName": "Keerthi Gana"
            },
            .........................
          ]
        }
   */


   
  // params: chatRoom, skip.
  app.get(`${baseUrl}/getGroupChat`, auth.isAuthorized, chatController.getGroupChat);
  /** 
   * @apiGroup CHAT
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chat/getGroupChat to get paginated chats of Group.
   * 
   * @apiParam {string} chatRoom Chat Room Id . (query params) (required)
   * @apiParam {number} skip skip value for pagination. (query params) (optional)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "All Chats Listed",
        "status": 200,
        "data": [
          {
              "chatId": "EVjxELO6",
              "modifiedOn": "2018-03-05T15:36:31.026Z",
              "createdOn": "2018-03-05T15:36:31.025Z",
              "message": "hello .. ..",
              "receiverId": "ieTVTYA8",
              "receiverName": "Keerthi Gana",
              "senderId": "-iYj5cA7k",
              "senderName": "some Name"
            },
            {
              "chatId": "-iYj5cA7k",
              "modifiedOn": "2018-03-05T15:36:39.548Z",
              "createdOn": "2018-03-05T15:36:39.547Z",
              "message": "hello  .. .. .. ",
              "receiverId": "EVjxELO6",
              "receiverName": "some Name",
              "senderId": "ieTVTYA8",
              "senderName": "Keerthi Gana"
            },
          .........................
        ]
      @apiErrorExample {json} Error-Response:
          {
          "error": true,
          "message": "No Chat Found",
          "status": 404,
          "data": null
          }
        }
 */

    app.post(`${baseUrl}/markChatAsSeen`,auth.isAuthorized,chatController.markChatAsSeen);

    /** 
   * @apiGroup CHAT
   * @apiVersion  1.0.0
   * @api {post} /api/v1/chat/markChatAsSeen to mark chats as seen.
   * @apiParam {string} chatId Chat Id of chat which is to be marked as seen. (query params) (required)
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "All Chats Listed",
        "status": 200,
        "data": [
          {
              "chatId": "EVjxELO6",
              "modifiedOn": "2018-03-05T15:36:31.026Z",
              "createdOn": "2018-03-05T15:36:31.025Z",
              "message": "hello .. ..",
              "receiverId": "ieTVTYA8",
              "receiverName": "Keerthi Gana",
              "senderId": "-iYj5cA7k",
              "senderName": "some Name"
            },
            {
              "chatId": "-iYj5cA7k",
              "modifiedOn": "2018-03-05T15:36:39.548Z",
              "createdOn": "2018-03-05T15:36:39.547Z",
              "message": "hello  .. .. .. ",
              "receiverId": "EVjxELO6",
              "receiverName": "some Name",
              "senderId": "ieTVTYA8",
              "senderName": "Keerthi Gana"
            },
          .........................
        ]
      }
 */



    app.get(`${baseUrl}/countUnseenChat`,auth.isAuthorized,chatController.countUnSeenChat);

/**
   * @apiGroup CHAT
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chat/countUnseenChat to get count of unseen messages.
   * 
   * @apiParam {string} userId userId of logged in user. (query params) (required)
   * @apiParam {string} senderId userId sending user. (query params) (required)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "unseen chat count found.",
        "status": 200,
        "data": 5
      }
 */

    app.get(`${baseUrl}/findUnseenChat`,auth.isAuthorized,chatController.findUnSeenChat);

/**
   * @apiGroup CHAT
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chat/findUnseenChat to get paginated unseen chats of user.
   * 
   * @apiParam {string} userId userId of logged in user. (query params) (required)
   * @apiParam {string} senderId userId sending user. (query params) (required)
   * @apiParam {number} skip skip value for pagination. (query params) (optional)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "chat found and listed.",
        "status": 200,
        "data": [
          {
              "chatId": "EVjxELO6",
              "modifiedOn": "2018-03-05T15:36:31.026Z",
              "createdOn": "2018-03-05T15:36:31.025Z",
              "message": "hello .. ..",
              "receiverId": "ieTVTYA8",
              "receiverName": "Keerthi Gana",
              "senderId": "-iYj5cA7k",
              "senderName": "some Name"
            },
            {
              "chatId": "-iYj5cA7k",
              "modifiedOn": "2018-03-05T15:36:39.548Z",
              "createdOn": "2018-03-05T15:36:39.547Z",
              "message": "hello  .. .. .. ",
              "receiverId": "EVjxELO6",
              "receiverName": "some Name",
              "senderId": "ieTVTYA8",
              "senderName": "Keerthi Gana"
            },
          .........................
        ]
      }
 */




    app.get(`${baseUrl}/userListOfUnseenChat`,auth.isAuthorized,chatController.findUserListOfUnseenChat);
/**
   * @apiGroup CHAT
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chat/userListOfUnseenChat to get user list of unseen chats.
   * 
   * @apiParam {string} userId userId of logged in user. (query params) (required)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "All Chats Listed",
        "status": 200,
        "data": [
          {
              "chatId": "EVjxELO6",
              "modifiedOn": "2018-03-05T15:36:31.026Z",
              "createdOn": "2018-03-05T15:36:31.025Z",
              "message": "hello .. ..",
              "receiverId": "ieTVTYA8",
              "receiverName": "Keerthi Gana",
              "senderId": "-iYj5cA7k",
              "senderName": "some Name"
            },
            {
              "chatId": "-iYj5cA7k",
              "modifiedOn": "2018-03-05T15:36:39.548Z",
              "createdOn": "2018-03-05T15:36:39.547Z",
              "message": "hello  .. .. .. ",
              "receiverId": "EVjxELO6",
              "receiverName": "some Name",
              "senderId": "ieTVTYA8",
              "senderName": "Keerthi Gana"
            },
          .........................
        ]
      }
 */



}