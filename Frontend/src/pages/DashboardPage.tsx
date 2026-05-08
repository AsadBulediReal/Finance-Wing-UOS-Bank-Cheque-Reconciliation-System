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
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 font-heading">
            System <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Real-time overview of cheques and bank statement reconciliation status.
          </p>
        </div>
        
        <button 
          onClick={() => setIsConfirmOpen(true)}
          disabled={isReconciling}
          className="flex items-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          {isReconciling ? (
            <Loader2 className="h-5 w-5 animate-spin relative z-10" />
          ) : (
            <Play className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
          )}
          <span className="relative z-10">{isReconciling ? 'Processing Match Engine...' : 'Run Auto-Reconcile'}</span>
        </button>
      </div>
      
      <SummaryCards key={`summary-${refreshKey}`} />
      
      <div className="pt-4">
        <RecentReconciliationTable key={`table-${refreshKey}`} />
      </div>

      <ConfirmAction
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleAutoReconcile}
        title="Trigger Match Engine"
        description="This will execute the automated reconciliation logic across all pending records. This process is optimized for high accuracy. Proceed?"
        confirmText="Execute Now"
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

