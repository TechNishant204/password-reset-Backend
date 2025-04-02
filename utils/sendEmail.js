const nodemailer = require("nodemailer");
require("dotenv").config();

// Mail Sender Function to send OTP to the user
exports.sendEmail = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `Mahto-TechPro <no-reply@mahto.com>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log(info);
  } catch (error) {
    console.log("Error sending mail: " + error.message);
    throw new Error("Failed to send reset email");
  }
  // return info;
};

exports.sendSignUpEmail = async (email, username) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `Mahto-TechPro <no-reply@mahto.com>`,
      to: `${email}`,
      subject: "Registration Successful",
      html: `
      <h2>Congratulations, ${username}! </h2><br>
      <p>Your account has been successfully created.</p>
      <p>You can now log in to your account.</p>
    `,
    });
    console.log(info);
  } catch (error) {
    console.log("Error sending mail: " + error.message);
    // throw new Error("Failed to send signup email");
  }
};
