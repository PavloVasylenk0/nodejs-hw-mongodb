import * as authService from '../services/auth.js';

export const register = async (req, res) => {
  const userData = req.body;
  const user = await authService.register(userData);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password,
  );

  // Зберігаємо refresh token в cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken,
      user,
    },
  });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({
      status: 401,
      message: 'Refresh token not found',
    });
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshSession(refreshToken);

  // Оновлюємо refresh token в cookies
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken,
    },
  });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  // Очищаємо cookies
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const sendResetEmail = async (req, res) => {
  const { email } = req.body;
  await authService.sendResetEmail(email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
