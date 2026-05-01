import express from 'express';
import multer from 'multer';
import { getStatements, uploadStatement, getStatementTransactions, getAllTransactions } from '../controllers/statementController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getStatements);
router.get('/transactions', getAllTransactions);
router.post('/upload', upload.single('file'), uploadStatement);
router.get('/:id/transactions', getStatementTransactions);

export default router;
