import ErrorHandler from '../utils/Error.js';
import sendMail, { EmailEnums, EmailTemplates } from '../utils/sendMail.js';

export default async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal server Error';

  if (err.message === 'jwt expired') {
    const message = `Session Is Expired`;
    err = new ErrorHandler(message, 401);
  }

  // wrong mongodb id error
  if (err.name === 'CastError') {
    const message = `Resources not found with this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt error
  if (err.name === 'JsonWebTokenError') {
    const message = `Your url is invalid please try again letter`;
    err = new ErrorHandler(message, 400);
  }

  // jwt expired
  if (err.name === 'TokenExpiredError') {
    const message = `Your Url is expired please try again letter!`;
    err = new ErrorHandler(message, 400);
  }

  if (err.statusCode === 500) {
    const errorDetails = {
      api: req.originalUrl,
      errorMessage: err.message,
      status: err.status || 500,
      date: new Date().toLocaleString(),
      additionalInfo: JSON.stringify(err.stack),
    };

    await sendMail({
      template: EmailTemplates.error,
      type: EmailEnums.error,
      context: errorDetails,
    });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
