const socketio = require('socket.io')
const mongoose = require('mongoose')
const shortid = require('shortid')
const logger = require('./loggerLib.js')
const token = require('./tokenLib.js')
const time = require('./timeLilb')
const check = require('./checkLib.js')
const response = require('./responseLib.js')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const smtpTransport = require('nodemailer-smtp-transport')
const events = require('events')
const eventEmitter = new events.EventEmitter()

const mailerLib = require('./mailerLib')
const mailerLibToShare = require('./mailerLibToShare')
const redis = require('./redisLib')

const ChatModel = mongoose.model('Chat')
const ChatRoomModel = mongoose.model('ChatRoom')

let setServer = (server) => {
    let io = socketio.listen(server)
    let myIo = io.of('');

    myIo.on('connection', (socket) => {
        console.log('on connection -- emitting user')

        socket.on('activate-email', (data) => {

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport(smtpTransport({
                service: 'Gmail',
                auth: {
                    user: 'ping.youu@gmail.com',
                    pass: 'pingYou@421KGana'
                }
            }));

            let mailOptions = {
                from: '"PingYou" <admin@pingyouu.com>', // sender address
                to: data.email, // list of receivers
                subject: 'Welcome to pingYouu✔', // Subject line
                html: `Hi ${data.firstName} ${data.lastName},<br><br>
                Welcome to the pingYouu Chat App 
                <br>Please find the Activation Link : <a href="http://localhost:4200/activate?activateToken=${data.activateUserToken}" >Click Here</a> .<br>            
                <br>We would like to welcome you to our pingYouu Chat App(A real time chat Application...)<br>                                        
                <b>pingYouu<br>
                Keerthi Gana </b>` // html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });


        });//end verify email   



        socket.emit('verifyUser', "")

        socket.on('set-user', (authToken) => {
            token.verifyClaimsWithOutSecret(authToken, (err, user) => {

                if (err) {

                    socket.emit('auth-error', { status: 500, error: 'please provide correct auth token' })
                } else {
                    console.log('user is verified and setting details...')
                    let currentUser = user.data;
                    //setting socketuser
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    let key = socket.userId
                    let value = fullName

                    redis.setNewOLUserInHash('onlineUsers', key, value, (err, result) => {
                        if (err) {
                            console.log(err.message, 'socketLib:setNewOLUserInHash', 10)
                        } else {
                            redis.getAllUsersInHash('onlineUsers', (err, result) => {
                                console.log(`${fullName} successfully added to online user list.`)
                                logger.info(`${fullName} successfully added to online user list.`)
                                console.log(`${fullName} is online`);
                                socket.room = 'Ping-Youu-Group'
                                socket.join(socket.room)
                                socket.emit('online-user-list', result)
                                console.log(result)
                                myIo.to(socket.room).emit('online-user-list', result)
                            })//end for individual
                        }
                    })//end for individual

                    //START SET-ROOM USER
                    redis.setNewOLUserInHash('onlineUsersList', key, value, (err, result) => {
                        if (err) {
                            console.log(`some error occurred`)
                        } else {
                            // getting online users list.
                            redis.getAllUsersInHash('onlineUsersList', (err, result) => {
                                console.log(`--- inside getAllUsersInAHas function ---`)
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(`${fullName} is online`);
                                    // setting room name
                                    socket.room = 'PingYouu'
                                    // joining chat-group room.
                                    socket.join(socket.room) // joining global Socket room
                                    eventEmitter.emit('connect-all-sockets', currentUser); //create and join all sockets 
                                    socket.to(socket.room).broadcast.emit('online-user-room-list', result);
                                }
                            })
                        }
                    })//end for room
                    //END SET ROOM USER
                }

            })//end verify token
        })//end set-user


        socket.on('disconnect', () => {
            console.log("user is disconnected");
            console.log(socket.userId);
            //user will emit when disconnected
            //will remove user from online user list
            if (socket.userId) {
                redis.deleteUserFromHash('onlineUsers', socket.userId)
                redis.getAllUsersInHash('onlineUsers', (err, result) => {
                    if (err) {
                        logger.error(err.message, "socketLib:getAllUsersInAHash", 10)
                    } else {
                        socket.leave(socket.room)
                        myIo.to(socket.room).emit('online-user-list', result)
                        socket.emit('online-user-list', result)

                    }
                })//end get all users in a hash
                //START FOR ROOM
                redis.deleteUserFromHash('onlineUsersList', socket.userId)
                redis.getAllUsersInHash('onlineUsersList', (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        socket.broadcast.emit('online-user-room-list', result);
                    }
                }) //END FOR ROOM
            }
        }) // end of on disconnect  

        socket.on('chat-msg', (data) => {
            console.log("socket chat-msg called")
            console.log(data);
            data['chatId'] = shortid.generate()
            console.log(data);

            // event to save chat.
            setTimeout(function () {
                eventEmitter.emit('individual-save-chat', data);
            }, 2000)
            myIo.emit(data.receiverId, data)
            // myIo.to(data.receiverId).emit('message', data);   

        }); // end chat-msg

        socket.on('typing', (fullName) => {
            socket.to(socket.room).broadcast.emit('typing', fullName);
        });// end typing

        /*******************START OF ROOM SOCKET********************* */

        socket.on('create-chat-room', (chatRoomDetails) => {
            console.log(chatRoomDetails)
            let globalChatRoom = 'PingYouu'
            chatRoomDetails.chatRoomId = shortid.generate();
            socket.room = chatRoomDetails.chatRoomId
            // joining chat-group room.
            socket.join(globalChatRoom)
            socket.join(socket.room)
            setTimeout(function () {
                eventEmitter.emit('create-dbChatRoom', chatRoomDetails)
            }, 500)
            socket.to(globalChatRoom).broadcast.emit('created-chatroom', chatRoomDetails);
            console.log(`Chat Room Created by ${chatRoomDetails.userName}`)
        });// end on create chat room

        socket.on('join-chat-room', (chatRoomDetails) => {
            socket.room = chatRoomDetails.chatRoomId
            // joining chat-group room.
            socket.join(socket.room)
            setTimeout(function () {
                eventEmitter.emit('join-dbChatRoom', chatRoomDetails)
            }, 500)
            socket.to(socket.room).broadcast.emit('joined-chatroom', chatRoomDetails);
            console.log(`Chat Room joined by ${chatRoomDetails.userName}`)
        });// end on join chat room


        socket.on('leave-chat-room', (chatRoomDetails) => {
            socket.room = chatRoomDetails.chatRoomId
            // leaving chat-group room.
            //console.log(chatRoomDetails)
            socket.to(socket.room).broadcast.emit('leaved-chatroom', chatRoomDetails);
            console.log(`Chat Room leaved by ${chatRoomDetails.userName}`)
            setTimeout(function () {
                eventEmitter.emit('leave-dbChatRoom', chatRoomDetails)
            }, 500)
            setTimeout(function () {
                socket.leave(socket.room)
            }, 1000)
        });// end on leave chat room



        socket.on('delete-chat-room', (chatRoomDetails) => {
            socket.room = chatRoomDetails.chatRoomId
            // delete leaving chat-group room.
            console.log(chatRoomDetails)
            setTimeout(function () {
                let findQuery = {
                    $and: [
                        { userId: chatRoomDetails.userId },
                        { chatRoomId: chatRoomDetails.chatRoomId }
                    ]
                }
                console.log(findQuery)
                ChatRoomModel.findOneAndRemove(findQuery).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        chatRoomDetails.response = err;
                        socket.to(socket.room).emit('deleted-chatroom', chatRoomDetails);
                    } else if (check.isEmpty(result)) {
                        chatRoomDetails.response = `${chatRoomDetails.userName} failed to delete the Chat Room { ${chatRoomDetails.chatRoomTitle} }. User not an Admin '`;
                        socket.to(socket.room).emit('deleted-chatroom', chatRoomDetails);
                    } else {
                        chatRoomDetails.response = `${chatRoomDetails.userName} deleted the room { ${chatRoomDetails.chatRoomTitle} } successfully'`;
                        socket.to(socket.room).emit('deleted-chatroom', chatRoomDetails);
                    }
                });// end ChatRoomModel model find and remove
            }, 500)
            setTimeout(function () {
                socket.leave(socket.room)
            }, 1000)
        });// end on leave chat room


        socket.on('share-invite-chat-room', (chatRoomDetails) => {
            let sendEmailOptions = {
                email: chatRoomDetails.emailId,
                subject: `InviteLink to Join "${chatRoomDetails.chatRoomTitle}" from PingYouu`,
                html: `<b> ${chatRoomDetails.emailId}</b> 
                <br><br>
                <br> ${chatRoomDetails.senderName} has invited you to join group <b>"${chatRoomDetails.chatRoomTitle}"</b> via Ping Youu  <br><br>                     
                <br>Before joining group, Please be sure to login or register yourself to PingYouu.<a class="dropdown-item" href="${chatRoomDetails.url}/signup">Register Here</a> <br>
                <br>Please find the Invite Link : <a class="dropdown-item" href="${chatRoomDetails.chatRoomLink}">Click Here</a> .<br>
                <br>We would like to welcome you to our pingYouu Chat App(A real time chat Application...)<br>                                        
                <b>pingYouu<br>
                Keerthi Gana </b>`
            }
            mailerLibToShare.autoGenEmail(sendEmailOptions);
        });// end on share chat room


        socket.on('chat-room-msg', (data) => {
            console.log("socket chat-msg called")
            data['chatId'] = shortid.generate()
            console.log(data);
            // event to save chat.
            setTimeout(function () {
                eventEmitter.emit('save-chat', data);
            }, 1000)
            console.log(`chat-room : ${data.chatRoom}`)
            socket.broadcast.emit('get-chat', data);
            //myIo.emit('get-chat', data)

        });

        eventEmitter.on('connecting-all-sockets', (retrievedRoomDetails) => {
            console.log('Connected to all Sockets Room')
            for (let x in retrievedRoomDetails) {
                let socketRoomFound = retrievedRoomDetails[x].chatRoomId
                socket.join(socketRoomFound)        
               // console.log(socketRoomFound)
            }
        }); // end of connecting all sockets .
        




        /*******************END OF ROOM SOCKET********************* */

    })//end on CONNECTION
}//end set server

//database operations are kept outside of socket.io code 
//saving chats to database
eventEmitter.on('individual-save-chat', (data) => {
    let newChat = new ChatModel({
        chatId: data.chatId,
        senderId: data.senderId,
        senderName: data.senderName,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        message: data.message,
        chatRoom: data.chatRoom,
        createdOn: data.createdOn
    });
    newChat.save((err, result) => {
        if (err) {
            logger.error("error occurred", "socketLib:individual-save-chat", 10);
            console.log(`error occured: ${err}`)
        } else if (result == undefined || result == null || result == '') {
            logger.error("error occurred", "socketLib:individual-save-chat", 10);
            console.log('chat not saved')
        } else {
            logger.info("Chat Saved", "socketLib:individual-save-chat", 10);
            console.log('chat saved')
            console.log(result)
        }
    })
})


/*******************START OF ROOM EVENTS********************* */

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
}); // end of connecting all sockets .



eventEmitter.on('create-dbChatRoom', (chatRoomDetails) => {
    ChatRoomModel.findOne({ chatRoomId: chatRoomDetails.chatRoomId })
        .exec((err, retrievedRoomDetails) => {
            if (err) {
                console.log(err)
            } else if (check.isEmpty(retrievedRoomDetails)) {
                //console.log(chatRoomDetails)
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
                //baseurl of frontend(angular) http://localhost:4200/joinroom/chatRoomId
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
                })
            } else {
                console.log('Room Cannot Be Created.Room Already Present with given Title')
            }
        })
});



eventEmitter.on('join-dbChatRoom', (chatRoomDetails) => {

    ChatRoomModel.find({ "activeUsers.id": { $ne: chatRoomDetails.userId } })
        .exec((err, retrievedRoomDetails) => {
            if (err) {
                console.log(err)
            } else if (check.isEmpty(retrievedRoomDetails)) {
                console.log('User Already joined the Chat Room')
            } else {
                console.log(chatRoomDetails)
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
                });// end ChatRoomModel update
            }
        })
});



eventEmitter.on('leave-dbChatRoom', (chatRoomDetails) => {

    ChatRoomModel.findOne({ activeUsers: { $elemMatch: { id: chatRoomDetails.userId } } })
        .exec((err, retrievedRoomDetails) => {
            if (err) {
                console.log(err)
            } else if (check.isEmpty(retrievedRoomDetails)) {
                console.log(chatRoomDetails)
                console.log('User Not in the Chat Room')
            } else {
                console.log(chatRoomDetails)
                ChatRoomModel.update({ 'chatRoomId': chatRoomDetails.chatRoomId }, { $pull: { activeUsers: { id: chatRoomDetails.userId, user: chatRoomDetails.userName } } })
                    .exec((err, result) => {
                        if (err) {
                            console.log(err)
                            console.log('Failed To leave the Chat Room ')
                        } else if (check.isEmpty(result)) {
                            console.log('No Chat Room Found ')
                        } else {
                            console.log('User leaved from Chat Room')
                        }
                    });// end ChatRoomModel update
            }
        })
});



eventEmitter.on('delete-dbChatRoom', (chatRoomDetails) => {
    console.log(chatRoomDetails)
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
            logger.error(err.message, 'Chat Room Controller: deleteRoom', 10)
            let apiResponse = response.generate(true, 'Failed To delete room', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No Room Found or User Not an Admin', 'Chat Room Controller: deleteRoom')
            let apiResponse = response.generate(true, 'No Room Found or User Not an Admin', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the room successfully', 200, result)
            res.send(apiResponse)
        }
    });// end ChatRoomModel model find and remove
});



eventEmitter.on('save-chat', (data) => {
    console.log(data)
    let newRoomChat = new ChatModel({
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
    newRoomChat.save((err, result) => {
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
    });
}); // end of saving chat.




/*******************END OF ROOM EVENTS********************* */


module.exports = {
    setServer: setServer
}