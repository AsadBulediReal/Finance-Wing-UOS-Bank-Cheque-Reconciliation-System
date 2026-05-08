import { Request, Response } from 'express';
import BankStatement from '../models/BankStatement';
import StatementTransaction from '../models/StatementTransaction';
import * as XLSX from 'xlsx';
import { parse } from 'date-fns';
import { runAutoReconciliation } from '../services/reconciliationService';

export const getStatements = async (req: Request, res: Response) => {
  try {
    const statements = await BankStatement.find().sort({ createdAt: -1 });
    res.json(statements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatementTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transactions = await StatementTransaction.find({ statementId: id }).sort({ transactionDate: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { status, dateFrom, dateTo, valueDateFrom, valueDateTo, accountNo, refNo, description, debit, credit, amount, balance, page = 1, limit = 50 } = req.query;
    let query: any = {};
    
    if (status) query.status = status;
    
    // Specific field filters
    if (accountNo) query.accountNo = { $regex: accountNo, $options: 'i' };
    if (refNo) query.refNo = { $regex: refNo, $options: 'i' };
    if (description) query.description = { $regex: description, $options: 'i' };
    
    if (debit) query.debit = parseFloat(debit as string);
    if (credit) query.credit = parseFloat(credit as string);
    
    // Unified amount search (checks both debit and credit)
    if (amount) {
      const amt = parseFloat(amount as string);
      query.$or = [
        { debit: amt },
        { credit: amt }
      ];
    }

    if (balance) query.balance = parseFloat(balance as string);

    if (dateFrom || dateTo) {
      query.transactionDate = {};
      if (dateFrom) {
        const start = new Date(dateFrom as string);
        start.setHours(0, 0, 0, 0);
        query.transactionDate.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo as string);
        end.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = end;
      }
    }

    if (valueDateFrom || valueDateTo) {
      query.valueDate = {};
      if (valueDateFrom) {
        const start = new Date(valueDateFrom as string);
        start.setHours(0, 0, 0, 0);
        query.valueDate.$gte = start;
      }
      if (valueDateTo) {
        const end = new Date(valueDateTo as string);
        end.setHours(23, 59, 59, 999);
        query.valueDate.$lte = end;
      }
    }

    const p = parseInt(page as string);
    const l = parseInt(limit as string);

    const total = await StatementTransaction.countDocuments(query);
    const transactions = await StatementTransaction.find(query)
      .sort({ transactionDate: -1 })
      .skip((p - 1) * l)
      .limit(l);

    res.json({
      data: transactions,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadStatement = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read raw data as 2D array to extract metadata
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Extract metadata from specific rows/cols based on the provided structure
    // Row 2 (index 1), Col B (index 1) = Account Number
    const extractedAccountNo = rawData[1] && rawData[1][1] ? rawData[1][1].toString() : 'UNKNOWN';
    // Row 6 (index 5), Col B (index 1) = Branch Name
    const extractedBankName = rawData[5] && rawData[5][1] ? rawData[5][1].toString() : 'UNKNOWN';

    const { uploadedBy } = req.body;
    
    // Parse transactions starting from row 11 (index 10)
    // We use sheet_to_json with range: 10 which treats row 11 as header
    const transactionsData: any[] = XLSX.utils.sheet_to_json(worksheet, { range: 10 });

    const transactions = transactionsData
      .filter((row: any) => row['Transaction Date'] || row['Description']) // Skip truly empty rows
      .map((data: any) => {
        const debitVal = data['Debit'];
        const creditVal = data['Credit'];
        
        // Helper to parse dates from various formats
        const parseDate = (dateStr: any) => {
          if (!dateStr) return new Date();
          if (dateStr instanceof Date) return dateStr;
          
          const s = dateStr.toString().trim();
          if (!s) return new Date();

          // Try parsing DD/MM/YYYY
          try {
            const parsed = parse(s, 'dd/MM/yyyy', new Date());
            if (!isNaN(parsed.getTime())) return parsed;
          } catch (e) {}

          // Fallback to native Date
          return new Date(s);
        };

        // Helper to parse numbers and remove commas
        const parseNum = (val: any) => {
          if (val === undefined || val === null || val === '') return null;
          const s = val.toString().replace(/,/g, '').trim();
          const n = parseFloat(s);
          return isNaN(n) ? null : n;
        };

        return {
          accountNo: extractedAccountNo,
          bankName: extractedBankName,
          transactionDate: parseDate(data['Transaction Date']),
          valueDate: parseDate(data['Value Date']),
          refNo: (data['Transaction Reference No'] || '').toString().trim(),
          description: (data['Description'] || '').toString().trim(),
          debit: parseNum(debitVal),
          credit: parseNum(creditVal),
          balance: parseNum(data['Balance']) || 0,
          status: 'UNRECONCILED',
          uploadedBy: uploadedBy || 'System User'
        };
      });

    if (transactions.length > 0) {
      await StatementTransaction.insertMany(transactions);
      
      // Trigger Auto-Reconciliation
      try {
        await runAutoReconciliation();
      } catch (e) {
        console.error('Auto-reconciliation trigger failed:', e);
      }
    }
    
    res.status(201).json({ message: `${transactions.length} records imported successfully` });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};
