"use strict";
const nodemailer = require("nodemailer");
//const transporter = require('')


module.exports = async function(email, linkCode) {
    // create reusable transporter object using the default SMTP transport

        console.log(email);
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: "maysondamarante@mswareg.com", // generated ethereal user
                pass: "#Fabiano11", // generated ethereal password
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
            subject: "PASSWORD RECOVERY", // Subject line
            text: `Clique no link para redefinir sua senha - ${linkCode} `
        })
        console.log(info)
        return {status:true, msg: info};
        
    } catch (err) {
        
        return { status: false, msg: err };
    }


}



