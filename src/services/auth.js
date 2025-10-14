import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import createError from 'http-errors';
import {
  generateTokens,
  isTokenExpired,
  generateResetToken,
  verifyResetToken,
} from '../utils/tokens.js';
import { sendResetPasswordEmail } from '../utils/email.js';

export const register = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw createError(409, 'Email in use');
    }

    const user = new User(userData);
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, 'Email or password is wrong');
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw createError(401, 'Email or password is wrong');
    }

    // Видалення старих сесій
    await Session.deleteMany({ userId: user._id });

    // Генерація токенів
    const tokens = generateTokens();

    // Створення нової сесії
    const session = new Session({
      userId: user._id,
      ...tokens,
    });

    await session.save();

    return {
      user,
      ...tokens,
    };
  } catch (error) {
    throw error;
  }
};

export const refreshSession = async (refreshToken) => {
  try {
    // Пошук сесії
    const session = await Session.findOne({ refreshToken });

    if (!session) {
      throw createError(401, 'Invalid refresh token');
    }

    // Перевірка чи не протермінований refresh token
    if (isTokenExpired(session.refreshTokenValidUntil)) {
      await Session.findByIdAndDelete(session._id);
      throw createError(401, 'Refresh token expired');
    }

    // Видалення старої сесії
    await Session.findByIdAndDelete(session._id);

    // Генерація нових токенів
    const newTokens = generateTokens();

    // Створення нової сесії
    const newSession = new Session({
      userId: session.userId,
      ...newTokens,
    });

    await newSession.save();

    return newTokens;
  } catch (error) {
    throw error;
  }
};

export const logout = async (refreshToken) => {
  try {
    await Session.deleteOne({ refreshToken });
  } catch (error) {
    throw error;
  }
};

export const findSessionByAccessToken = async (accessToken) => {
  return await Session.findOne({ accessToken });
};

export const sendResetEmail = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw createError(404, 'User not found!');
    }

    const resetToken = generateResetToken(email);

    await sendResetPasswordEmail(email, resetToken);

    return { message: 'Reset password email sent successfully' };
  } catch (error) {

    if (error.status === 404) {
      throw error;
    }
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};

export const resetPassword = async (token, newPassword) => {
  try {

    const decoded = verifyResetToken(token);

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      throw createError(404, 'User not found!');
    }

    // ПЕРЕВІРКА ЧИ ТОКЕН ВЖЕ ВИКОРИСТАНО
    if (user.isTokenUsed(token)) {
      throw createError(
        401,
        'Token has already been used. Please request a new reset link.',
      );
    }

    user.password = newPassword;

    user.markTokenAsUsed(token);

    await user.save();

    const deleteResult = await Session.deleteMany({ userId: user._id });

    return { message: 'Password reset successfully' };
  } catch (error) {

    if (error.message === 'Token is expired or invalid') {
      throw createError(401, 'Token is expired or invalid.');
    }
    if (error.status === 404 || error.status === 401) {
      throw error;
    }
    throw error;
  }
};
