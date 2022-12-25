"use strict";
const nodemailer = require("nodemailer");
//const transporter = require('')
const emailSender = process.env.USER_EMAIL
const passSender = process.env.USER_PASS

module.exports = async function (email, emailMsg, emailSubject) {
    // create reusable transporter object using the default SMTP transport

        console.log(email);
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: emailSender, // generated ethereal user
                pass: passSender, // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
            console.log(success)
        }
    });
    
    console.log('chegou aqui 2')

    try {
        console.log('chegou aqui 3')

        var info = await transporter.sendMail({
            from: '<maysondamarante@mswareg.com>', // sender address
            to: email, // list of receivers
            subject: emailSubject, // Subject line
            text: emailMsg
        })
        console.log(info)
        return {status:true, msg: info};
        
    } catch (err) {
        
        return { status: false, msg: err };
    }


}



