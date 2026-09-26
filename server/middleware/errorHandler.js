export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message
  });
};
