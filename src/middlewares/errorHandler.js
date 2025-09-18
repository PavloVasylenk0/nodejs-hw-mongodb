import createError from 'http-errors';

const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Обробка mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      status: 400,
      message: 'Validation failed',
      data: errors,
    });
  }

  // Обробка mongoose cast errors (неправильний ID)
  if (error.name === 'CastError') {
    return res.status(400).json({
      status: 400,
      message: 'Invalid ID format',
      data: 'Please provide a valid contact ID',
    });
  }

  if (error.status) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message,
      data: null,
    });
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Internal server error',
  });
};

export default errorHandler;
