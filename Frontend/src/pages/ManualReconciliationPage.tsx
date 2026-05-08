import { useState } from 'react';
import { Search, CheckSquare, AlertCircle } from 'lucide-react';
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
    <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in-up">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 font-heading">
            Manual <span className="text-indigo-600">Reconciliation</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Precisely match unreconciled cheques with bank statement transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Live System</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">
        <div className="flex flex-col h-full">
          <ChequeSelector onSelect={handleChequeSelect} selectedId={selectedCheque?._id} refreshKey={refreshKey} />
        </div>
        <div className="flex flex-col h-full">
          <StatementSelector onTransactionsLoad={handleTransactionsLoad} refreshKey={refreshKey} autoSearchAmount={selectedCheque?.amount} />
        </div>
      </div>

      {selectedCheque && (
        <div className="animate-fade-in-up">
          <MatchWorkspace 
            selectedCheque={selectedCheque} 
            possibleMatches={possibleMatches} 
            onReconciled={handleActionComplete}
          />
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm transition-all hover:shadow-md group">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckSquare className="h-5 w-5 text-emerald-600" />
          </div>
          <h4 className="font-bold text-emerald-900 mb-1 text-sm uppercase tracking-tight">CASHED (MATCHED)</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">Cheque is found and matched with a bank statement record.</p>
        </div>
        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 shadow-sm transition-all hover:shadow-md group">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <h4 className="font-bold text-amber-900 mb-1 text-sm uppercase tracking-tight">UNCHASED (CLEARED)</h4>
          <p className="text-xs text-amber-700 leading-relaxed">Cheque is cleared but no matching record found in the current statement.</p>
        </div>
        <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 shadow-sm transition-all hover:shadow-md group">
          <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Search className="h-5 w-5 text-rose-600" />
          </div>
          <h4 className="font-bold text-rose-900 mb-1 text-sm uppercase tracking-tight">UNRECONCILED</h4>
          <p className="text-xs text-rose-700 leading-relaxed">Requires manual review to find an exact matching bank statement record.</p>
        </div>
      </div>
    </div>
  );
}

