const nodemailer = require('nodemailer'); 
const { 
  EMAIL_HOST, 
  EMAIL_PORT, 
  EMAIL_USER, 
  EMAIL_PASS 
} = process.env; 
const transporter = nodemailer.createTransport({ 
  host: EMAIL_HOST, 
  port: Number(EMAIL_PORT || 587), 
  secure: false, 
  auth: { user: EMAIL_USER, pass: EMAIL_PASS } 
}); 
async function sendMail(to, subject, html) { 
  const info = await transporter.sendMail({ 
    from: EMAIL_USER, to, subject, html 
  }); 
  return info; 
} 
module.exports = { sendMail };
