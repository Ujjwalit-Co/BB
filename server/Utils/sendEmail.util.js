import nodemailer from 'nodemailer';

export const forgetPassword_Mail = async function (email, subject, message) {
    // create reusable transporter object using the default SMTP transport
    let transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        post: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // send mail with defined transport object
    await transport.sendMail({
        from: process.env.SMTP_FROM_EMAIL, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: message, // html body
        
    });
};


export const contactUs_Mail = async function (email,subject, message) {
    // create reusable transporter object using the default SMTP transport
    let transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        post: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // send mail with defined transport object
    await transport.sendMail({
        from: email, // sender address
        to: process.env.SMTP_FROM_EMAIL, // list of receivers
        subject: subject, // Subject line
        html: message, // html body
        
    });
};

