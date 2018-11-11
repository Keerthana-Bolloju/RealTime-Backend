'use strict';
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport')
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(smtpTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        service:'gmail',
        auth: {
            user: 'ping.youu@gmail.com', // generated ethereal user
            pass: 'pingYou@421KGana' // generated ethereal password
        }
    }));

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"PingYou" <admin@pingyouu.com>', // sender address
        to: '', // list of receivers
        subject: 'Welcome to pingYouu✔', // Subject line
        html: '' // html body
    };

    // send mail with defined transport object
    let autoGenEmail = (receiver,message)=>{
        
        mailOptions.to = receiver;
        mailOptions.html = message;

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }else{
                console.log('Message sent: %s', info.messageId);
            }
            
        });

    }

   module.exports = {
       autoGenEmail:autoGenEmail
   } 