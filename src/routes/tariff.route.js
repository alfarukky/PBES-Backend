import { Router } from 'express';
import multer from 'multer';
import {
  importTariffs,
  getTariffs,
} from '../controllers/tariffs.controllers.js';

const teriffRoute = Router();
const upload = multer({ dest: 'src/uploads/' });

teriffRoute.post('/import', upload.single('file'), importTariffs);
teriffRoute.get('/', getTariffs);

export default teriffRoute;
