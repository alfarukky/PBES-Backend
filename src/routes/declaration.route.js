import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createDeclaration,
  getDeclarations,
  getDeclarationById,
  assessDeclaration,
  updateDeclaration,
  cancelDeclaration,
} from '../controllers/declaration.controllers.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';
import {
  createDeclarationSchema,
  updateDeclarationSchema,
} from '../validation/decleration.validation.js';
import {
  objectIdSchema,
  declarationQuerySchema,
} from '../validation/objectId.validation.js';

const declarationRoute = Router();

declarationRoute.post(
  '/',
  authMiddleware,
  roleMiddleware(['OperationalOfficer', 'CancellationOfficer']),
  generateMiddleWare(createDeclarationSchema, 'body'),
  createDeclaration
);

declarationRoute.get(
  '/',
  authMiddleware,
  roleMiddleware([
    'OperationalOfficer',
    'CancellationOfficer',
    'Admin',
    'SuperAdmin',
  ]),
  generateMiddleWare(declarationQuerySchema, 'query'),
  getDeclarations
);
declarationRoute.get(
  '/:id',
  authMiddleware,
  roleMiddleware([
    'OperationalOfficer',
    'CancellationOfficer',
    'Admin',
    'SuperAdmin',
  ]),
  generateMiddleWare(objectIdSchema, 'params'),
  getDeclarationById
);

declarationRoute.get(
  '/:id/assess',
  authMiddleware,
  roleMiddleware(['OperationalOfficer', 'CancellationOfficer']),
  generateMiddleWare(objectIdSchema, 'params'),
  assessDeclaration
);

declarationRoute.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['OperationalOfficer', 'CancellationOfficer']),
  generateMiddleWare(objectIdSchema, 'params'),
  generateMiddleWare(updateDeclarationSchema, 'body'),
  updateDeclaration
);

declarationRoute.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware('CancellationOfficer'),
  generateMiddleWare(objectIdSchema, 'params'),
  cancelDeclaration
);

export default declarationRoute;
