import { useState } from 'react';
import ChequeSelector from '../components/reconciliation/ChequeSelector';
import StatementSelector from '../components/reconciliation/StatementSelector';
import MatchWorkspace from '../components/reconciliation/MatchWorkspace';

export default function ManualReconciliationPage() {
  const [selectedCheque, setSelectedCheque] = useState<any>(null);
  const [possibleMatches, setPossibleMatches] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChequeSelect = (cheque: any) => {
    setSelectedCheque(cheque);
  };

  const handleTransactionsLoad = (txs: any[]) => {
    setPossibleMatches(txs);
  };

  const handleActionComplete = () => {
    setSelectedCheque(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manual Reconciliation</h1>
        <p className="text-slate-500 mt-2">Manually match unreconciled cheques with bank statement transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <ChequeSelector onSelect={handleChequeSelect} selectedId={selectedCheque?._id} refreshKey={refreshKey} />
        <StatementSelector onTransactionsLoad={handleTransactionsLoad} refreshKey={refreshKey} />
      </div>

      {selectedCheque && (
        <MatchWorkspace 
          selectedCheque={selectedCheque} 
          possibleMatches={possibleMatches.filter(tx => tx.credit === selectedCheque.amount || tx.debit === selectedCheque.amount)} 
          onReconciled={handleActionComplete}
        />
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2 text-sm">CASHED (MATCHED)</h4>
          <p className="text-xs text-green-700">Cheque is found and matched with a bank statement record.</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2 text-sm">UNCHASED (CLEARED BUT NO BS MATCH)</h4>
          <p className="text-xs text-yellow-700">Cheque is presented/cashed but no matching record found in the selected bank statement.</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2 text-sm">UNRECONCILED (NEED REVIEW)</h4>
          <p className="text-xs text-red-700">System could not find exact match by cheque no but found some possible matches.</p>
        </div>
      </div>
    </div>
  );
}

