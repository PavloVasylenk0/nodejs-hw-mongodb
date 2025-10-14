import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import getEnvVar from './getEnvVar.js';

export const generateTokens = () => {
  const accessToken = crypto.randomBytes(32).toString('hex');
  const refreshToken = crypto.randomBytes(32).toString('hex');

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 хвилин
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ); // 30 днів

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

export const isTokenExpired = (validUntil) => {
  return new Date() > new Date(validUntil);
};

// JWT скидання паролю
export const generateResetToken = (email) => {
  const jwtSecret = getEnvVar('JWT_SECRET');

  const token = jwt.sign({ email }, jwtSecret, {
    expiresIn: '10m',
  });

  return token;
};

export const verifyResetToken = (token) => {
  try {
    const jwtSecret = getEnvVar('JWT_SECRET');
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error('Token is expired or invalid');
  }
};
