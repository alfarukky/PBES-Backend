import { Router } from 'express';
import {
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation,
} from '../controllers/commandLocation.controllers.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';
import {
  createLocationSchema,
  updateLocationSchema,
  paginationSchema,
} from '../validation/commandLocation.validation.js';
import { objectIdSchema } from '../validation/objectId.validation.js';

const locationRoute = Router();

locationRoute.post(
  '/create',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  generateMiddleWare(createLocationSchema),
  createLocation
);

locationRoute.get(
  '/',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  generateMiddleWare(paginationSchema),
  getLocations
);

locationRoute.patch(
  '/:id/update',
  authMiddleware,
  roleMiddleware(['SuperAdmin', 'Admin']),
  generateMiddleWare(updateLocationSchema),
  updateLocation
);

locationRoute.delete(
  '/:id/delete',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  generateMiddleWare(objectIdSchema, 'params'),
  deleteLocation
);

export default locationRoute;
