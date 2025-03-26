import { Router } from 'express';
import * as authController from '../controllers/auth.controllers.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  loginSchema,
  registerSchema,
  resendVerificationEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/auth.validation.js';
import { resendVerificationEmailLimiter } from '../middleware/limiter.middleware.js';

const authRoute = Router();
authRoute.post(
  '/register',
  authMiddleware, // Ensure only logged-in users can access this endpoint
  generateMiddleWare(registerSchema),
  authController.registerUser
);
authRoute.post(
  '/login',
  generateMiddleWare(loginSchema),
  authController.loginUser
);

// Email verification endpoint
authRoute.get('/verify-email/:token', authController.verifyEmail);

// Resend verification email endpoint
authRoute.post(
  '/resend-verification-email',
  resendVerificationEmailLimiter,
  generateMiddleWare(resendVerificationEmailSchema), // Apply the new schema
  authController.resendVerificationEmail
);

authRoute.post(
  '/forgot-password',
  generateMiddleWare(forgotPasswordSchema),
  authController.forgotPassword
);

authRoute.post(
  '/reset-password/:token', // Token is now part of the URL
  generateMiddleWare(resetPasswordSchema),
  authController.resetPassword
);
export default authRoute;
