export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message: err.message,
      ...(err.fields && { fields: err.fields }),
      ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack })
    }
  });
};
