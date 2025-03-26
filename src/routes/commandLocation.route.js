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
  objectIdSchema,
} from '../validation/commandLocation.validation.js';

const locationRoute = Router();

locationRoute.post(
  '/',
  authMiddleware,
  roleMiddleware('superAdmin'),
  generateMiddleWare(createLocationSchema),
  createLocation
);

locationRoute.get(
  '/',
  authMiddleware,
  roleMiddleware('superAdmin'),
  generateMiddleWare(paginationSchema),
  getLocations
);

locationRoute.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('superAdmin', 'Admin'),
  generateMiddleWare(updateLocationSchema),
  updateLocation
);

locationRoute.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('superAdmin'),
  generateMiddleWare(objectIdSchema, 'params'),
  deleteLocation
);

export default locationRoute;
