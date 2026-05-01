import express from 'express';
import multer from 'multer';
import { getCheques, addCheque, uploadCheques, getChequeById } from '../controllers/chequeController';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(getCheques)
  .post(addCheque);

router.get('/:id', getChequeById);
router.post('/upload', upload.single('file'), uploadCheques);

export default router;
