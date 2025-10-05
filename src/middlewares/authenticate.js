import createError from 'http-errors';
import { Session } from '../models/session.js';
import { isTokenExpired } from '../utils/tokens.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Please provide access token');
    }

    const accessToken = authHeader.split(' ')[1];

    // Пошук сесії в базі даних
    const session = await Session.findOne({ accessToken }).populate('userId');

    if (!session) {
      throw createError(401, 'Invalid access token');
    }

    // Перевірка чи не протермінований access token
    if (isTokenExpired(session.accessTokenValidUntil)) {
      await Session.findByIdAndDelete(session._id);
      throw createError(401, 'Access token expired');
    }

    // Додаємо користувача до запиту
    req.user = {
      _id: session.userId._id,
      name: session.userId.name,
      email: session.userId.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
