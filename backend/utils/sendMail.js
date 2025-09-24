import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
export const EmailEnums = Object.freeze({
  otp: 'otp',
  error: 'error',
});

export const EmailTemplates = Object.freeze({
  otp: 'otp',
  error: 'error',
});

const handlebarsOptions = {
  viewEngine: {
    partialsDir: path.resolve('./views/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./views/'),
};

const sendMail = async ({ email, subject, otp, template, type, context }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  transporter.use('compile', hbs(handlebarsOptions));

  switch (type) {
    case EmailEnums.otp:
      // For sending Otp mail

      const mailOptions = {
        from: `"SALES MANAGMENT" <process.env.SMTP_MAIL>`,
        template,
        to: email,
        subject: subject,
        context: {
          otp,
        },
      };
      await transporter.sendMail(mailOptions);
      break;
    case EmailEnums.error:
      // For sending Otp mail

      const errorOptions = {
        from: `"SALES MANAGMENT" <process.env.SMTP_MAIL>`,
        template,
        to: 'bilalajmery2124@gmail.com',
        subject: 'Error in api',
        context,
      };
      await transporter.sendMail(errorOptions);
      break;

    default:
      break;
  }
};

export default sendMail;
