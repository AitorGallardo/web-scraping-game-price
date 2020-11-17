const nodemailer = require('nodemailer');

require('dotenv').config();

async function sendEmail (args) {

    const title = args.title ? args.title : '🚀🚀🚀BUY SEKIRO🚀🚀🚀';
    const price = args.price ? args.price : '<Unknown>'
    const link = args.link ? args.link : '<Unknown>'
    const message = args.message ? args.message : `<p style="font-size:48px; font-weight: bold"> Price: ${price} € </p> </br>   ${link}`; 
  
    try {
      let transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });
  
      var mailOptions = {
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TO,
        subject: title,
        html: message
      };
  
       await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
    return;
    } catch (err) {
      console.log(err)
    }
  }

  module.exports = sendEmail;