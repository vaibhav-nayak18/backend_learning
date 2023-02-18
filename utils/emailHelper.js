import nodemailer from "nodemailer";

const mailHelper = async (options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const message = {
    from: "v@g.com", // sender address
    to: options.toEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  await transporter.sendMail(message);
};

export default mailHelper;
