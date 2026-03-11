const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

class MailService {
  constructor() {
    this.transporter = null;
    this.initP = this.init();
  }

  async init() {
    const emailPass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
    if (process.env.EMAIL_USER && emailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: emailPass
        }
      });
      console.log('Production Mailer initialized with Gmail.');
    } else {
      console.log('No EMAIL_USER found in .env. Falling back to Ethereal Testing Mailer...');
      try {
        let testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, 
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('Mock Ethereal Mailer initialized for testing.');
      } catch(err) {
        console.error("Failed to initialize Ethereal test account:", err);
      }
    }
  }

  async sendEmail(to, subject, text) {
    await this.initP;
    if (!this.transporter) {
      throw new Error("Transporter not initialized");
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"AI CRM Assistant" <${process.env.EMAIL_USER || 'crm@ethereal.email'}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
      });

      console.log("Email sent: %s", info.messageId);
      
      if (!process.env.EMAIL_USER) {
         const url = nodemailer.getTestMessageUrl(info);
         console.log("Preview URL: %s", url);
         return { success: true, previewUrl: url };
      }
      return { success: true };
    } catch (error) {
      console.error("Error sending email: ", error);
      throw error;
    }
  }
}

module.exports = new MailService();
