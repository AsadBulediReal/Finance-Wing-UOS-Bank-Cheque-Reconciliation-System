import { useState } from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import RecentReconciliationTable from '../components/dashboard/RecentReconciliationTable';
import { Play, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { ConfirmAction } from '../components/ui/ConfirmAction';

export default function DashboardPage() {
  const [isReconciling, setIsReconciling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive" } | null>(null);

  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertConfig({ isOpen: true, title, description, variant });
  };

  const handleAutoReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await api.autoReconcile();
      showAlert('Auto-Reconciliation Complete', `System successfully matched ${res.matchedCount} cheques with bank statements.`);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || error.message, 'destructive');
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
          onClick={() => setIsConfirmOpen(true)}
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

      <ConfirmAction
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleAutoReconcile}
        title="Run Auto-Reconciliation"
        description="This will scan all uncashed cheques and attempt to match them with available bank statement records. Do you want to proceed?"
        confirmText="Run Now"
      />

      <ConfirmAction
        isOpen={!!alertConfig?.isOpen}
        onClose={() => setAlertConfig(null)}
        onConfirm={() => setAlertConfig(null)}
        title={alertConfig?.title || 'Notification'}
        description={alertConfig?.description || ''}
        confirmText="OK"
        showCancel={false}
        variant={alertConfig?.variant}
      />
    </div>
  );
}

