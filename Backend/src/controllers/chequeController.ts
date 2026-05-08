import { Request, Response } from 'express';
import Cheque from '../models/Cheque';
import StatementTransaction from '../models/StatementTransaction';
import ReconciliationRecord from '../models/ReconciliationRecord';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { runAutoReconciliation } from '../services/reconciliationService';

export const getCheques = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      search, 
      chequeNo, 
      description, 
      amount, 
      dateFrom, 
      dateTo, 
      transDateFrom, 
      transDateTo, 
      matchType,
      page = 1, 
      limit = 50, 
      sortBy = 'issueDate', 
      sortOrder = 'desc' 
    } = req.query;
    let query: any = {};
    
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else if (typeof status === 'string' && status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    
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

    // Filter by Bank Transaction Date
    if (transDateFrom || transDateTo) {
      let transQuery: any = {};
      if (transDateFrom) {
        const start = new Date(transDateFrom as string);
        start.setHours(0, 0, 0, 0);
        transQuery.$gte = start;
      }
      if (transDateTo) {
        const end = new Date(transDateTo as string);
        end.setHours(23, 59, 59, 999);
        transQuery.$lte = end;
      }

      // 1. Find matching StatementTransactions
      const matchingTransactions = await StatementTransaction.find({ transactionDate: transQuery }).select('_id');
      const transIds = matchingTransactions.map(t => t._id);

      // 2. Find ReconciliationRecords for these transactions
      const records = await ReconciliationRecord.find({ transactionId: { $in: transIds } }).select('chequeId');
      const chequeIds = records.map(r => r.chequeId);

      // 3. Constrain the main query to these cheques
      if (query._id) {
        query._id = { $all: [query._id, { $in: chequeIds }] }; // Merge if already present
      } else {
        query._id = { $in: chequeIds };
      }
    }

    // Filter by Match Type (AUTO/MANUAL)
    if (matchType) {
      const records = await ReconciliationRecord.find({ matchType: matchType as any }).select('chequeId');
      const chequeIds = records.map(r => r.chequeId);
      
      if (query._id) {
        query._id = { $all: [query._id, { $in: chequeIds }] };
      } else {
        query._id = { $in: chequeIds };
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
      .populate('transactionId', 'transactionDate description');

    const enrichedCheques = cheques.map(cheque => {
      const record = records.find(r => r.chequeId.toString() === cheque._id.toString());
      return {
        ...cheque.toObject(),
        bsDate: record && record.transactionId ? (record.transactionId as any).transactionDate : null,
        bsDescription: record && record.transactionId ? (record.transactionId as any).description : null,
        matchType: record ? record.matchType : null,
        reconciledBy: record ? record.reconciledBy : null
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
export const exportCheques = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      search, 
      chequeNo, 
      description, 
      amount, 
      dateFrom, 
      dateTo, 
      transDateFrom, 
      transDateTo,
      matchType,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = req.query;
    
    let query: any = {};
    
    // REUSE FILTERING LOGIC
    if (status) query.status = status;
    if (matchType) {
      const records = await ReconciliationRecord.find({ matchType: matchType as any }).select('chequeId');
      const chequeIds = records.map(r => r.chequeId);
      if (query._id) query._id = { $all: [query._id, { $in: chequeIds }] };
      else query._id = { $in: chequeIds };
    }
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

    if (transDateFrom || transDateTo) {
      let transQuery: any = {};
      if (transDateFrom) {
        const start = new Date(transDateFrom as string);
        start.setHours(0, 0, 0, 0);
        transQuery.$gte = start;
      }
      if (transDateTo) {
        const end = new Date(transDateTo as string);
        end.setHours(23, 59, 59, 999);
        transQuery.$lte = end;
      }

      const matchingTransactions = await StatementTransaction.find({ transactionDate: transQuery }).select('_id');
      const transIds = matchingTransactions.map(t => t._id);
      const records = await ReconciliationRecord.find({ transactionId: { $in: transIds } }).select('chequeId');
      const chequeIds = records.map(r => r.chequeId);

      if (query._id) {
        query._id = { $all: [query._id, { $in: chequeIds }] };
      } else {
        query._id = { $in: chequeIds };
      }
    }

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortField = sortBy as string;

    const cheques = await Cheque.find(query).sort({ [sortField]: sortDir });

    const chequeIds = cheques.map(c => c._id);
    const records = await ReconciliationRecord.find({ chequeId: { $in: chequeIds } })
      .populate('transactionId', 'transactionDate description');

    const exportData = cheques.map(cheque => {
      const record = records.find(r => r.chequeId.toString() === cheque._id.toString());
      return {
        'Issue Date': new Date(cheque.issueDate).toLocaleDateString(),
        'Transaction Date': record && record.transactionId ? new Date((record.transactionId as any).transactionDate).toLocaleDateString() : 'N/A',
        'Cheque No': cheque.chequeNo,
        'Description': cheque.description,
        'BS Description': record && record.transactionId ? (record.transactionId as any).description : 'N/A',
        'Amount': cheque.amount,
        'Status': cheque.status,
        'Match Type': record ? record.matchType : 'N/A',
        'Reconciled By': record ? record.reconciledBy : 'N/A'
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cheques');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=cheques_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
