import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_APP_PASSWORD,
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Zero Trust Auth" <${process.env.OTP_EMAIL}>`,
    to: email,
    subject: "Login OTP Verification",
    text: `Your OTP for login verification is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
