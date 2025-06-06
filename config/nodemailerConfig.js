const nodemailer=require("nodemailer");

require('dotenv').config()
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    }
})
//function for sending mail

const sendMail= async(to,subject,text,html)=>{
    try{
       const result= await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        })
        console.log(result);
        
        console.log(`Email sent to ${to}`);
    }catch(error){
        console.log(error);
        console.error("Error in sending mail")
    }
}
module.exports = sendMail;
