import { Request, Response } from 'express';
import Cheque from '../models/Cheque';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const summary = await Cheque.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    let totalCheques = 0;
    let totalAmount = 0;
    
    const formattedSummary = {
      CASHED: { count: 0, amount: 0 },
      UNCASHED: { count: 0, amount: 0 },
      UNRECONCILED: { count: 0, amount: 0 },
    };

    summary.forEach(stat => {
      const status = stat._id as keyof typeof formattedSummary;
      if (formattedSummary[status]) {
        formattedSummary[status] = { count: stat.count, amount: stat.amount };
      }
      totalCheques += stat.count;
      totalAmount += stat.amount;
    });

    res.json({
      summary: formattedSummary,
      total: { count: totalCheques, amount: totalAmount }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
