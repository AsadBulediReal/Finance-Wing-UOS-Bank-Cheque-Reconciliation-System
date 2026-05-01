import { Request, Response } from 'express';
import Cheque from '../models/Cheque';
import ReconciliationRecord from '../models/ReconciliationRecord';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { runAutoReconciliation } from '../services/reconciliationService';

export const getCheques = async (req: Request, res: Response) => {
  try {
    const { status, search, chequeNo, description, amount, dateFrom, dateTo, page = 1, limit = 50, sortBy = 'issueDate', sortOrder = 'desc' } = req.query;
    let query: any = {};
    
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { chequeNo: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (chequeNo) query.chequeNo = { $regex: chequeNo, $options: 'i' };
    if (description) query.description = { $regex: description, $options: 'i' };
    if (amount) query.amount = parseFloat(amount as string);

    if (dateFrom || dateTo) {
      query.issueDate = {};
      if (dateFrom) {
        const start = new Date(dateFrom as string);
        start.setHours(0, 0, 0, 0);
        query.issueDate.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo as string);
        end.setHours(23, 59, 59, 999);
        query.issueDate.$lte = end;
      }
    }

    const p = parseInt(page as string);
    const l = parseInt(limit as string);

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortField = sortBy as string;

    const total = await Cheque.countDocuments(query);
    const cheques = await Cheque.find(query)
      .sort({ [sortField]: sortDir })
      .skip((p - 1) * l)
      .limit(l);

    // Enrich with BS Transaction Date if CASHED
    const chequeIds = cheques.map(c => c._id);
    const records = await ReconciliationRecord.find({ chequeId: { $in: chequeIds } })
      .populate('transactionId', 'transactionDate');

    const enrichedCheques = cheques.map(cheque => {
      const record = records.find(r => r.chequeId.toString() === cheque._id.toString());
      return {
        ...cheque.toObject(),
        bsDate: record && record.transactionId ? (record.transactionId as any).transactionDate : null
      };
    });

    res.json({
      data: enrichedCheques,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addCheque = async (req: Request, res: Response) => {
  try {
    const { issueDate, chequeNo, description, amount } = req.body;
    const newCheque = new Cheque({
      issueDate,
      chequeNo,
      description,
      amount,
    });
    const savedCheque = await newCheque.save();
    
    // Trigger Auto-Reconciliation
    try {
      await runAutoReconciliation();
    } catch (e) {
      console.error('Auto-reconciliation trigger failed:', e);
    }

    res.status(201).json(savedCheque);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadCheques = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results: any[] = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (data) => {
        // Map CSV columns to Cheque model fields
        results.push({
          issueDate: new Date(data['Issue Date'] || data.issueDate),
          chequeNo: data['Cheque No'] || data.chequeNo,
          description: data['Description'] || data.description,
          amount: parseFloat(data['Amount'] || data.amount),
        });
      })
      .on('end', async () => {
        try {
          const inserted = await Cheque.insertMany(results);
          
          // Trigger Auto-Reconciliation
          try {
            await runAutoReconciliation();
          } catch (e) {
            console.error('Auto-reconciliation trigger failed:', e);
          }

          res.status(201).json({ message: `${inserted.length} cheques uploaded successfully.`, count: inserted.length });
        } catch (dbError: any) {
          res.status(500).json({ message: 'Error saving to database', error: dbError.message });
        }
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getChequeById = async (req: Request, res: Response) => {
  try {
    const cheque = await Cheque.findById(req.params.id);
    if (!cheque) {
      return res.status(404).json({ message: 'Cheque not found.' });
    }
    res.json(cheque);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
