import { Router } from 'express';
import multer from 'multer';
import { importBanks, getBanks } from '../controllers/bank.controllers.js';

const bankRoute = Router();
const upload = multer({ dest: 'src/uploads/' });

bankRoute.post('/import', upload.single('file'), importBanks);
bankRoute.get('/', getBanks);

export default bankRoute;
