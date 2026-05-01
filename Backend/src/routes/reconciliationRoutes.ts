import express from 'express';
import { triggerAutoReconciliation, manualReconcile, markUnchased, getReconciliationDetails, getPotentialMatches } from '../controllers/reconciliationController';

const router = express.Router();

router.post('/auto', triggerAutoReconciliation);
router.post('/manual', manualReconcile);
router.post('/mark-unchased', markUnchased);
router.get('/details/:chequeId', getReconciliationDetails);
router.get('/potential-matches/:chequeId', getPotentialMatches);

export default router;
