import { Request, Response } from 'express';
import { runAutoReconciliation } from '../services/reconciliationService';
import Cheque from '../models/Cheque';
import StatementTransaction from '../models/StatementTransaction';
import ReconciliationRecord from '../models/ReconciliationRecord';

export const triggerAutoReconciliation = async (req: Request, res: Response) => {
  try {
    const result = await runAutoReconciliation();
    res.json({ message: 'Auto-reconciliation completed successfully.', ...result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const manualReconcile = async (req: Request, res: Response) => {
  try {
    const { chequeId, transactionId, userId } = req.body;

    const cheque = await Cheque.findById(chequeId);
    const transaction = await StatementTransaction.findById(transactionId);

    if (!cheque || !transaction) {
      return res.status(404).json({ message: 'Cheque or Transaction not found.' });
    }

    if (cheque.status === 'CASHED' || transaction.status === 'RECONCILED') {
      return res.status(400).json({ message: 'Items are already reconciled.' });
    }

    const record = new ReconciliationRecord({
      chequeId,
      transactionId,
      reconciledBy: userId || 'Manual Reviewer',
      matchType: 'MANUAL',
      matchedFields: ['MANUAL_VERIFICATION']
    });
    
    await record.save();

    cheque.status = 'CASHED';
    await cheque.save();

    transaction.status = 'RECONCILED';
    await transaction.save();

    res.json({ message: 'Manually reconciled successfully.', record });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markUnchased = async (req: Request, res: Response) => {
  try {
    const { chequeId } = req.body;
    console.log(`[Reconciliation] Resetting cheque: ${chequeId}`);
    
    const cheque = await Cheque.findById(chequeId);
    if (!cheque) {
      return res.status(404).json({ message: 'Cheque not found.' });
    }

    // 1. Find all reconciliation records for this cheque (should usually be one)
    const records = await ReconciliationRecord.find({ chequeId });
    console.log(`[Reconciliation] Found ${records.length} records to remove.`);

    for (const record of records) {
      // 2. Reset the associated bank transaction status
      if (record.transactionId) {
        await StatementTransaction.findByIdAndUpdate(record.transactionId, { status: 'UNRECONCILED' });
        console.log(`[Reconciliation] Reset bank transaction: ${record.transactionId}`);
      }
      // 3. Delete the reconciliation record
      await record.deleteOne();
    }

    // 4. Reset the cheque status to UNCASHED
    cheque.status = 'UNCASHED';
    await cheque.save();

    console.log(`[Reconciliation] Cheque ${chequeId} status reset to UNCASHED.`);

    res.json({ 
      message: 'Cheque reset to unchased. All links to bank statements have been removed.', 
      cheque 
    });
  } catch (error: any) {
    console.error(`[Reconciliation] Error in markUnchased for ${req.body.chequeId}:`, error);
    res.status(500).json({ message: error.message });
  }
};
export const getReconciliationDetails = async (req: Request, res: Response) => {
  try {
    const { chequeId } = req.params;
    const record = await ReconciliationRecord.findOne({ chequeId })
      .populate('chequeId')
      .populate('transactionId');
    
    if (!record) {
      console.warn(`[Reconciliation] No record found for chequeId: ${chequeId}`);
      return res.status(404).json({ message: 'No reconciliation record found for this cheque.' });
    }
    
    res.json(record);
  } catch (error: any) {
    console.error(`[Reconciliation] Error fetching details for ${req.params.chequeId}:`, error);
    res.status(500).json({ message: error.message });
  }
};

export const getPotentialMatches = async (req: Request, res: Response) => {
  try {
    const { chequeId } = req.params;
    const cheque = await Cheque.findById(chequeId);
    
    if (!cheque) {
      return res.status(404).json({ message: 'Cheque not found.' });
    }

    // Find unreconciled transactions with same amount
    const matches = await StatementTransaction.find({
      status: 'UNRECONCILED',
      $or: [
        { debit: cheque.amount },
        { credit: cheque.amount }
      ]
    });

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
