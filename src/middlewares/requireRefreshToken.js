import createError from 'http-errors';

const requireRefreshToken = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(createError(401, 'Refresh token not found'));
  }

  req.refreshToken = refreshToken;
  next();
};

export default requireRefreshToken;
