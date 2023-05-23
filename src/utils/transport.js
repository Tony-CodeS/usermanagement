const nodemailer = require('nodemailer');

exports.transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'e78c620341ece8',
    pass: '9aedcae0c9072f'
  }
});
