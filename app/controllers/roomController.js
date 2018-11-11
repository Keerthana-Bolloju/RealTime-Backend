const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLilb');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const AuthModel = mongoose.model('Auth')

const emailLib = require('../libs/mailerLib');

/* Models */

const ChatRoomModel = mongoose.model('ChatRoom')


 
/* Get all room Details */

let getAllTheRooms = (req, res) => {
    ChatRoomModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Chat Room Controller: getAllTheRooms', 10)
                let apiResponse = response.generate(true, 'Failed To Find Room Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Room Found', 'Chat Room Controller: getAllTheRooms')
                let apiResponse = response.generate(true, 'No Room Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Room Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all room Details

 
/* Get all room Details Joined*/
/* params : userId
*/

let getAllTheJoinedRooms = (req, res) => {
    ChatRoomModel.find({ activeUsers: { $elemMatch: { 'id': req.params.userId } } })
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Chat Room Controller: getAllTheJoinedRooms', 10)
                let apiResponse = response.generate(true, 'Failed To Find Room Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log(req.params)
                logger.info('No Room Found', 'Chat Room Controller: getAllTheJoinedRooms')
                let apiResponse = response.generate(true, 'No Room Found', 404, null)
                res.send(apiResponse)
            } else {

                let apiResponse = response.generate(false, 'All Room Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all room Details Joined



/* Get all room Details Available to Join*/
/* params : userId
*/

let getAllTheRoomsAvailableToJoin = (req, res) => {
    ChatRoomModel.find({ "activeUsers.id": { $ne: req.params.userId } })
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Chat Room Controller: getAllTheRoomsAvailableToJoin', 10)
                let apiResponse = response.generate(true, 'Failed To Find Room Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log(req.params)
                logger.info('No Room Found', 'Chat Room Controller: getAllTheRoomsAvailableToJoin')
                let apiResponse = response.generate(true, 'No Room Found', 404, null)
                res.send(apiResponse)
            } else {

                let apiResponse = response.generate(false, 'All Room Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all room Details available to Join





/* Get single room details */
/* params : chatRoomId
*/

let getSingleRoom = (req, res) => {
    ChatRoomModel.findOne({ 'chatRoomId': req.params.chatRoomId })
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Chat Room Controller: getSingleRoom', 10)
                let apiResponse = response.generate(true, 'Failed To Find Room Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Room Found', 'Chat Room Controller:getSingleRoom')
                let apiResponse = response.generate(true, 'No Room Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Room Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single room 


/* Function for Deleting Room  */
/* params : chatRoomId
*/

let deleteARoom = (req, res) => {
    let findQuery = {
        $and: [
            { userId: req.body.userId },
            { chatRoomId: req.body.chatRoomId }
        ]
    }
    console.log(findQuery)
    ChatRoomModel.findOneAndRemove(findQuery).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Chat Room Controller: deleteARoom', 10)
            let apiResponse = response.generate(true, 'Failed To delete room', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Room Found or User Not an Admin', 'Chat Room Controller: deleteARoom')
            let apiResponse = response.generate(true, 'No Room Found or User Not an Admin', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the room successfully', 200, result)
            res.send(apiResponse)
        }
    });// end ChatRoomModel model find and remove


}// end delete room

/* Function for editing Room  */
/* params : chatRoomId
   body   : ChatRoomTitle 
*/

let editARoom = (req, res) => {

    let options = req.body;
    ChatRoomModel.update({ 'chatRoomId': req.body.chatRoomId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Chat Room Controller: editARoom', 10)
            let apiResponse = response.generate(true, 'Failed To edit room details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Chat Room Found', 'Chat Room Controller: editARoom')
            let apiResponse = response.generate(true, 'No Chat Room Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Chat Room details Updated', 200, result)
            res.send(apiResponse)
        }
    });// end ChatRoomModel update


}// end edit room

module.exports = {

    getAllTheRooms:getAllTheRooms,
    getAllTheJoinedRooms:getAllTheJoinedRooms,
    getAllRoomsAvailableToJoin:getAllTheRoomsAvailableToJoin,
    getSingleRoom:getSingleRoom,
    editARoom:editARoom,
    deleteARoom:deleteARoom
}// end exports