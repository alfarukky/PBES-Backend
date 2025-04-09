import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';
import {
  suspendUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controllers.js';
import {
  createUserSchema,
  userQuerySchema,
} from '../validation/user.validation.js';
import { objectIdSchema } from '../validation/objectId.validation.js';
const userRoute = Router();

// Get all users (Admins+ only)
userRoute.get(
  '/get-all',
  authMiddleware,
  roleMiddleware(['SuperAdmin', 'Admin']),
  generateMiddleWare(userQuerySchema, 'query'),
  getAllUsers
);

userRoute.get(
  '/:id/get-user',
  authMiddleware,
  roleMiddleware(['SuperAdmin', 'Admin']),
  generateMiddleWare(objectIdSchema, 'params'),
  getUserById
);

// Suspend/activate user (Admins+ only)
userRoute.patch(
  '/:id/suspend-user',
  authMiddleware,
  roleMiddleware(['SuperAdmin', 'Admin']),
  generateMiddleWare(objectIdSchema, 'params'),
  suspendUser
);

userRoute.put(
  '/:id/update-user',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  generateMiddleWare(objectIdSchema, 'params'),
  generateMiddleWare(createUserSchema, 'body'),
  updateUser
);
userRoute.delete(
  '/:id/delete-user',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  generateMiddleWare(objectIdSchema, 'params'),
  deleteUser
);

export default userRoute;
