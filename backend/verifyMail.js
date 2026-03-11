require('dotenv').config();
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD }
});
t.verify((err) => {
  if (err) console.error(err.message);
  else console.log("VALID");
  process.exit(0);
});
