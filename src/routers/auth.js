import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  sendResetEmail,
  resetPassword,
} from '../controllers/auth.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
} from '../schemas/auth.js';
import requireRefreshToken from '../middlewares/requireRefreshToken.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), ctrlWrapper(register));
router.post('/login', validateBody(loginSchema), ctrlWrapper(login));
router.post('/refresh', requireRefreshToken, ctrlWrapper(refresh));
router.post('/logout', requireRefreshToken, ctrlWrapper(logout));
router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  ctrlWrapper(sendResetEmail),
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPassword),
);

export default router;
