'use strict';
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport')
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing

    // create reusable transporter object using the default SMTP transport
    let autoGenEmail = (sendEmailOptions)=>{
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
        to: sendEmailOptions.email, // list of receivers
        subject: sendEmailOptions.subject, // Subject line
        text: `Our User ${sendEmailOptions.name},
               Welcome's you to our PingYouu Chat application.
        `, // plain text body
        html: sendEmailOptions.html // html body
    };

    // send mail with defined transport object
          

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