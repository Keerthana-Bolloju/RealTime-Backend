/*
const socketio = require('socket.io')
const mongoose = require('mongoose')
const shortid = require('shortid')
const logger = require('./loggerLib.js')
const token = require('./tokenLib.js')
const check = require('./checkLib.js')
const response = require('./responseLib.js')
const time = require('./timeLilb')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const smtpTransport = require('nodemailer-smtp-transport')
const events = require('events')
const eventEmitter = new events.EventEmitter()

const mailerLib = require('./mailerLib')
const redis = require('./redisLib')

//models
const ChatModel = mongoose.model('Chat');
const ChatRoomModel = mongoose.model('ChatRoom');

let setServer = (server)=> {

    let io = socketio.listen(server);

    let myIo = io.of('/')

    myIo.on('connection', (socket) => {

        console.log("on connection--emitting verify user of room");

        socket.emit('verify-Room-User',"")

        socket.on('set-room-user',(authToken)=>{

            console.log("set-room-user called")
            token.verifyClaimsWithOutSecret(authToken,(err,result)=>{
                if(err){
                    socket.emit('auth-error',{status:500,error:'please provide correct auth token'}) 
                }else{
                    console.log('user is verified and setting details in room')
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    let key = currentUser.userId
                    let value = fullName
                    redis.setNewOLUserInHash("onlineUsersList", key, value, (err, result)=>{
                        if(err){
                            console.log(err.message,'socketLib:setNewOLUserInHash',10)
                        }else{
                            redis.getAllUsersInHash('onlineUsersList', (err, result)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    console.log(`${fullName} is online in room`);
                                    logger.info(`${fullName} successfully added to online user list in room.`)
                                    // setting room name
                                    socket.room = 'Ping Youu'
                                   
                                    socket.join(socket.room) // joining global Socket room
                                    eventEmitter.emit('connect-all-sockets', currentUser); //create and join all sockets 
                                    socket.to(socket.room).broadcast.emit('online-room-user-list', result);
                                }
                            })
                        }
                    })//end setUserOnlilne
                }
            })

        });//end setroomuser

        socket.on('disconnect-room', () => {
            console.log("user is disconnected from room");
            console.log(socket.userId);
            if(socket.userId){
                redis.deleteUserFromHash('onlineUsersList', socket.userId)
                redis.getAllUsersInHash('onlineUsersList', (err, result)=>{
                    if(err){
                        console.log(err)
                    }else{
                        socket.broadcast.emit('online-room-user-list', result);
                    }
                })
            }//end if
        });//end disconnect


        socket.on('create-chat-room', (chatRoomDetails) => {
            
            let globalChatRoom = 'Ping Youu'
            chatRoomDetails.chatRoomId = shortid.generate();
            socket.room = chatRoomDetails.chatRoomId
            
            socket.join(globalChatRoom)
            socket.join(socket.room)

            setTimeout(function () {
                eventEmitter.emit('create-dbChatRoom', chatRoomDetails)
            }, 500)

            socket.to(globalChatRoom).broadcast.emit('created-chatroom', chatRoomDetails);
            console.log(`Chat Room Created by ${chatRoomDetails.userName}`)

        });//end create chat room


        socket.on('join-chat-room', (chatRoomDetails) => {

            socket.room = chatRoomDetails.chatRoomId
            socket.join(socket.room)

            setTimeout(function () {
                eventEmitter.emit('join-dbChatRoom', chatRoomDetails)
            }, 500)

            socket.to(socket.room).broadcast.emit('joined-chatroom', chatRoomDetails);
            console.log(`Chat Room joined by ${chatRoomDetails.userName}`)

        });//end join chat room


        socket.on('leave-chat-room', (chatRoomDetails) => {
            socket.room = chatRoomDetails.chatRoomId
            console.log(chatRoomDetails)
            socket.to(socket.room).broadcast.emit('leaved-chatroom', chatRoomDetails);
            console.log(`Chat Room leaved by ${chatRoomDetails.userName}`)

            setTimeout(function () {
                eventEmitter.emit('leave-dbChatRoom', chatRoomDetails)
            }, 500)

            setTimeout(function () {
                socket.leave(socket.room)
            }, 2000)
        });//end leave chat room


        socket.on('delete-chat-room', (chatRoomDetails) => {
            socket.room = chatRoomDetails.chatRoomId

            setTimeout(function () {
                let findQuery = {
                    $and: [
                        { userId: chatRoomDetails.userId },
                        { chatRoomId: chatRoomDetails.chatRoomId }
                    ]
                }//end findQuery
                console.log(findQuery)
                ChatRoomModel.findOneAndRemove(findQuery).exec((err, result) => {
                    if(err){
                        chatRoomDetails.response = err;
                        socket.to(socket.room).emit('deleted-chatroom', chatRoomDetails);
                    }else if(check.isEmpty(result)){
                        chatRoomDetails.response = `${chatRoomDetails.userName} failed to delete the Chat Room { ${chatRoomDetails.chatRoomTitle} }. User is not an Admin '`;
                        socket.to(socket.room).emit('deleted-chatroom', chatRoomDetails);
                    }else{
                        chatRoomDetails.response = `${chatRoomDetails.userName} deleted the room { ${chatRoomDetails.chatRoomTitle} } successfully'`;
                        socket.to(socket.room).emit('deleted-chatroom', chatRoomDetails);
                    }
                })
            },500);//end setTimeOut

            setTimeout(function () {
                socket.leave(socket.room)
            }, 2000)

        });//end deleter chat room


        socket.on('share-chat-room', (chatRoomDetails) => {
            let sendEmailOptions = {
                to: chatRoomDetails.emailId,
                subject: `Invite Link to Join "${chatRoomDetails.chatRoomTitle}" `,
                html: `<b> ${chatRoomDetails.emailId}</b> 
                <br> Hope you are doing well. 
                <br> ${chatRoomDetails.senderName} has invited you to join group <b>"${chatRoomDetails.chatRoomTitle}"</b> via Ping Youu                         
                
                <br>Please find the Invite Link : <a class="dropdown-item" href="${chatRoomDetails.chatRoomLink}">Click Here</a> .
                <br>We would like to welcome you to our pingYouu Chat App(A real time chat Application...)<br>                                        
                <b>pingYouu<br>
                Keerthi Gana </b>`
            }
            mailerLib.autoGenEmail(sendEmailOptions);
        });//end share chat room


        socket.on('chat-room-msg', (data) => {
            console.log("socket chat-msg called")
            data['chatId'] = shortid.generate()
            console.log(data);
            // event to save chat.
            setTimeout(function () {
                eventEmitter.emit('save-chat', data);
            }, 1000)
            console.log(`chat room : ${data.chatRoom}`)

            socket.broadcast.emit('get-chat', data);
        });//end chat room msg


        eventEmitter.on('connecting-all-sockets', (retrievedRoomDetails) => {
            console.log('Connected to all Sockets Room event emitter')
            for (let x in retrievedRoomDetails) {
                let socketRoomFound = retrievedRoomDetails[x].chatRoomId
                
                socket.join(socketRoomFound)
            }
        }); // end of connecting all sockets .

        socket.on('typing', (fullName) => {
            socket.to(socket.room).broadcast.emit('typing', fullName);
        });



    });//end myIo.on-connection

}//end setServer

//database operations are kept outside of socket.io code


eventEmitter.on('connect-all-sockets', (currentUser) => {
    ChatRoomModel.find({ activeUsers: { $elemMatch: { 'id': currentUser.userId } } })
        .exec((err, retrievedRoomDetails) => {

            if (err) {
                console.log(err)

            } else if (check.isEmpty(retrievedRoomDetails)) {
                console.log('No Room Found to create Socket')

            } else {
                console.log(`${currentUser.firstName} Connecting all sockets`)
                eventEmitter.emit('connecting-all-sockets', retrievedRoomDetails); //create and join all sockets 

            }
        })
}); // end connecting all sockets .


// saving chats to database.
eventEmitter.on('save-chat', (data) => {
    let newChat = new ChatModel({

        chatId: data.chatId,
        senderName: data.senderName,
        senderId: data.senderId,
        receiverName: data.receiverName || '',
        receiverId: data.receiverId || '',
        message: data.message,
        chatRoom: data.chatRoom || '',
        chatRoomTitle: data.chatRoomTitle,
        createdOn: data.createdOn

    });

    newChat.save((err, result) => {
        if (err) {
            console.log(`error occurred: ${err}`);
        }
        else if (result == undefined || result == null || result == "") {
            console.log("Chat Is Not Saved.");
        }
        else {
            console.log("Chat Saved.");
            console.log(result);
        }
    })//end newchat save
})//end save chat


eventEmitter.on('create-dbChatRoom', (chatRoomDetails) => {
    ChatRoomModel.findOne({ chatRoomId: chatRoomDetails.chatRoomId })
    .exec((err, retrievedRoomDetails) => {
        if (err) {
            console.log(err)
        } else if(check.isEmpty(retrievedRoomDetails)){
            let newRoom = new ChatRoomModel({
                chatRoomId: chatRoomDetails.chatRoomId,
                chatRoomTitle: chatRoomDetails.chatRoomTitle,
                userName: chatRoomDetails.userName,
                userId: chatRoomDetails.userId,
                activeUsers: [{
                    id: chatRoomDetails.userId,
                    user: chatRoomDetails.userName
                }],
                createdOn: time.now()
            })
           
            newRoom.chatRoomLink = `${chatRoomDetails.chatRoomLink}/joinroom/${newRoom.chatRoomId}`;
            newRoom.save((err, newRoomCreated) => {
                if (err) {
                    console.log('Failed to create new Room')
                    console.log(err)
                } else {
                    newRoomObj = newRoomCreated.toObject();
                    console.log('Chat Room Created at server');
                    console.log(newRoomObj);
                }
            })//end newRoom save
        }else{
            console.log('Room Cannot Be Created.Room Already Present with given Title')
        }
    })//end exec
})//end create-dbChatRoom


eventEmitter.on('join-dbChatRoom', (chatRoomDetails) => {
    ChatRoomModel.find({ "activeUsers.id": { $ne: chatRoomDetails.userId } })
    .exec((err, retrievedRoomDetails) => {
        if (err) {
            console.log(err)
        } else if (check.isEmpty(retrievedRoomDetails)) {
            console.log('User Already joined the Chat Room')
        }else{
            ChatRoomModel.update({ 'chatRoomId': chatRoomDetails.chatRoomId }, { $push: { activeUsers: { id: chatRoomDetails.userId, user: chatRoomDetails.userName } } }).exec((err, result) => {
                if (err) {
                    console.log(err)
                    console.log('Failed To Join the Chat Room ')
                } else if (check.isEmpty(result)) {
                    console.log('No Chat Room Found ')
                } else {
                    console.log('User added to Chat Room')
                    console.log(result)
                }
            })//end chatroom model update
        } 
    })//end exec
})//end join dbChatroom


eventEmitter.on('leave-dbChatRoom', (chatRoomDetails) => {
    ChatRoomModel.findOne({ activeUsers: { $elemMatch: { id: chatRoomDetails.userId } } })
        .exec((err, retrievedRoomDetails) => {
            if (err) {
                console.log(err)
            } else if (check.isEmpty(retrievedRoomDetails)) {
                console.log(chatRoomDetails)
                console.log('User Not in the Chat Room')
            }else{
                console.log(chatRoomDetails)
                ChatRoomModel.update({ 'chatRoomId': chatRoomDetails.chatRoomId }, { $pull: { activeUsers: { id: chatRoomDetails.userId, user: chatRoomDetails.userName } } }).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        console.log('Failed To leave the Chat Room ')
                    } else if (check.isEmpty(result)) {
                        console.log('No Chat Room Found ')
                    } else {
                        console.log('User leaved from Chat Room')
                    }
                })//end chatroom model update afterleaving room
            }
        })//end exec
})//end leave db chat room


eventEmitter.on('delete-dbChatRoom', (chatRoomDetails) => {
    let findQuery = {
        $and: [
            { userId: req.body.userId },
            { chatRoomId: req.body.chatRoomId }
        ]
    }//end findQuery
    console.log(findQuery)
    ChatRoomModel.findOneAndRemove(findQuery).exec((err, result) => {
        if(err){
            console.log(err)
            logger.error(err.message, 'Chat Room Controller: deleteRoom', 10)
            let apiResponse = response.generate(true, 'Failed To delete room', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Room Found or User Not an Admin', 'Chat Room Controller: deleteRoom')
            let apiResponse = response.generate(true, 'No Room Found or User Not an Admin', 404, null)
            res.send(apiResponse)
        } else{
            let apiResponse = response.generate(false, 'Deleted the room successfully', 200, result)
            res.send(apiResponse)
        }
    })//end chat room model find and remove
})//end delete db chat room




module.exports = {
    setServer: setServer
}*/