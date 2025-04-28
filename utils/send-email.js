import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Looking to send emails in production? Check out our Email API/SMTP product!
var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmailUtil = async ({to,subject,text , html}) => {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        text: text
    });

    console.log("Message sent: %s", info.messageId);
    return info;
   //console.log("Message sent: %s", info.messageId);
};

export  {sendEmailUtil} ;
