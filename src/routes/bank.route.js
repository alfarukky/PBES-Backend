import { Router } from 'express';
import multer from 'multer';
import { importBanks, getBanks } from '../controllers/bank.controllers.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';
import { searchQuerySchema } from '../validation/objectId.validation.js';

const bankRoute = Router();
const upload = multer({ dest: 'src/uploads/' });

bankRoute.post(
  '/import',
  authMiddleware,
  roleMiddleware(['SuperAdmin']),
  upload.single('file'),
  importBanks
);
bankRoute.get('/', generateMiddleWare(searchQuerySchema, 'query'), getBanks);

export default bankRoute;
