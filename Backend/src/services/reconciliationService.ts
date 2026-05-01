import Cheque from '../models/Cheque';
import StatementTransaction from '../models/StatementTransaction';
import ReconciliationRecord from '../models/ReconciliationRecord';


export const runAutoReconciliation = async () => {
  try {
    const unchasedCheques = await Cheque.find({ status: { $in: ['UNCASHED', 'UNRECONCILED'] } });
    const unreconciledTransactions = await StatementTransaction.find({ status: 'UNRECONCILED' });

    let matchCount = 0;

    for (const cheque of unchasedCheques) {
      let matchedTransaction = null;
      let matchedFields: string[] = ['AMOUNT'];

      // 1. PRIORITY: Amount + Cheque Number (in RefNo or Description)
      matchedTransaction = unreconciledTransactions.find(transaction => {
        const matchAmount = transaction.debit === cheque.amount || transaction.credit === cheque.amount;
        if (!matchAmount) return false;

        const inRefNo = transaction.refNo && transaction.refNo.includes(cheque.chequeNo);
        const inDescription = transaction.description && transaction.description.includes(cheque.chequeNo);
        return inRefNo || inDescription;
      });

      if (matchedTransaction) {
        matchedFields.push('CHEQUE_NO');
      }

      // 2. PRIORITY: Amount + Description match (if no Cheque No match)
      if (!matchedTransaction && cheque.description) {
        matchedTransaction = unreconciledTransactions.find(transaction => {
          const matchAmount = transaction.debit === cheque.amount || transaction.credit === cheque.amount;
          if (!matchAmount) return false;

          // Normalize whitespace: replace multiple spaces/tabs with a single space
          const chequeDesc = cheque.description.toLowerCase().replace(/\s+/g, ' ').trim();
          const transDesc = (transaction.description || '').toLowerCase().replace(/\s+/g, ' ').trim();
          
          // Ensure both descriptions are non-empty and have meaningful content (at least 3 chars)
          if (chequeDesc.length < 3 || transDesc.length < 3) return false;
          
          return transDesc.includes(chequeDesc) || chequeDesc.includes(transDesc);
        });
        
        if (matchedTransaction) {
          matchedFields.push('DESCRIPTION');
        }
      }

      if (matchedTransaction) {
        // EXACT OR DESCRIPTION MATCH FOUND!
        const record = new ReconciliationRecord({
          chequeId: cheque._id,
          transactionId: matchedTransaction._id,
          reconciledBy: 'Auto-Reconciliation Engine',
          matchType: 'AUTO',
          matchedFields
        });
        await record.save();

        cheque.status = 'CASHED';
        await cheque.save();

        matchedTransaction.status = 'RECONCILED';
        await matchedTransaction.save();

        matchCount++;
        // Remove transaction from array so it's not matched again
        unreconciledTransactions.splice(unreconciledTransactions.indexOf(matchedTransaction), 1);
      } else {
        // 3. FALLBACK: Just Amount matches (Possible Match)
        const anyAmountMatch = unreconciledTransactions.some(transaction => 
          transaction.debit === cheque.amount || transaction.credit === cheque.amount
        );

        if (anyAmountMatch) {
          cheque.status = 'UNRECONCILED';
          await cheque.save();
        } else {
          // No match at all anymore
          cheque.status = 'UNCASHED';
          await cheque.save();
        }
      }
    }

    return { success: true, matchedCount: matchCount };
  } catch (error: any) {
    console.error('Auto Reconciliation Error:', error);
    throw new Error('Failed to run auto reconciliation: ' + error.message);
  }
};
