import { Router } from 'express';
import multer from 'multer';
import {
  importTariffs,
  getTariffs,
} from '../controllers/tariffs.controllers.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { searchQuerySchema } from '../validation/objectId.validation.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';

const teriffRoute = Router();
const upload = multer({ dest: 'src/uploads/' });

teriffRoute.post(
  '/import',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  upload.single('file'),
  importTariffs
);
teriffRoute.get(
  '/',
  generateMiddleWare(searchQuerySchema, 'query'),
  getTariffs
);

export default teriffRoute;
