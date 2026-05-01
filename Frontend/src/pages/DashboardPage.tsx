import { useState } from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import RecentReconciliationTable from '../components/dashboard/RecentReconciliationTable';
import { Play, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function DashboardPage() {
  const [isReconciling, setIsReconciling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAutoReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await api.autoReconcile();
      alert(`Auto-reconciliation complete! Matched ${res.matchedCount} cheques.`);
      setRefreshKey(prev => prev + 1); // Trigger refresh of cards and table
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard &ndash; Reconciliation Summary</h1>
          <p className="text-slate-500 mt-2">Overview of cheques and their reconciliation status.</p>
        </div>
        
        <button 
          onClick={handleAutoReconcile}
          disabled={isReconciling}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isReconciling ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {isReconciling ? 'Reconciling...' : 'Run Auto-Reconcile'}
        </button>
      </div>
      
      <SummaryCards key={`summary-${refreshKey}`} />
      
      <RecentReconciliationTable key={`table-${refreshKey}`} />
    </div>
  );
}

