import { Request, Response } from 'express';
import Cheque from '../models/Cheque';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    console.log('[Dashboard] Fetching summary statistics...');
    
    const summary = await Cheque.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: { $ifNull: ['$amount', 0] } }
        }
      }
    ]);

    console.log('[Dashboard] Aggregation result:', JSON.stringify(summary));

    const formattedSummary: Record<string, { count: number; amount: number }> = {
      CASHED: { count: 0, amount: 0 },
      UNCASHED: { count: 0, amount: 0 },
      UNRECONCILED: { count: 0, amount: 0 },
    };

    let totalCheques = 0;
    let totalAmount = 0;
    
    if (Array.isArray(summary)) {
      summary.forEach(stat => {
        const status = stat._id;
        
        // Only map if it's one of our known statuses
        if (status && formattedSummary.hasOwnProperty(status)) {
          formattedSummary[status] = { 
            count: Number(stat.count) || 0, 
            amount: Number(stat.amount) || 0 
          };
        }
        
        totalCheques += Number(stat.count) || 0;
        totalAmount += Number(stat.amount) || 0;
      });
    }

    const responseData = {
      summary: formattedSummary,
      total: { count: totalCheques, amount: totalAmount }
    };

    res.json(responseData);
  } catch (error: any) {
    console.error('[Dashboard] Critical error fetching summary:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard summary', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
