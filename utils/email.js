const Email = require("email-templates");
const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const email = new Email({
  message: {
    from: process.env.EMAIL_USER,
  },
  transport: transporter,
  send: true,
  preview: false,

  // 🔥 THIS LINE FIXES YOUR PROBLEM
  views: {
    root: path.join(__dirname, "../views/emails"),
  },
});

module.exports = email;