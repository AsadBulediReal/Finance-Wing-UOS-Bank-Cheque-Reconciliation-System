import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Pagination from '../ui/Pagination';
import ReconciliationDetailsModal from '../dashboard/ReconciliationDetailsModal';
import { ConfirmAction } from '../ui/ConfirmAction';
import { RotateCcw, ListFilter, Search } from 'lucide-react';

export default function ChequeTable() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  });
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(null);
  const [resettingChequeId, setResettingChequeId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive" } | null>(null);

  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertConfig({ isOpen: true, title, description, variant });
  };

  const fetchCheques = (page = 1, limit = pagination.limit) => {
    setIsLoading(true);
    api.getCheques({ page, limit })
      .then(res => {
        setCheques(res.data);
        setPagination({
          page: res.page,
          totalPages: res.totalPages,
          total: res.total,
          limit: limit
        });
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCheques(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCheques(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchCheques(1, newSize);
  };

  const handleResetCheque = async (id: string) => {
    try {
      await api.markUnchased(id);
      showAlert('Success', 'Cheque reset successfully.');
      fetchCheques(pagination.page);
      setResettingChequeId(null);
    } catch (err) {
      showAlert('Error', 'Failed to update cheque status.', 'destructive');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CASHED':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-emerald-100">CASHED</span>;
      case 'UNCASHED':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-100">UNCASHED</span>;
      case 'UNRECONCILED':
        return <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-rose-100">UNRECONCILED</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-slate-100">{status}</span>;
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] shadow-premium border-0 overflow-hidden animate-fade-in-up">
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-transparent flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight font-heading flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ListFilter className="h-4 w-4 text-white" />
            </div>
            Active Cheque Register
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time inventory of all cheques</p>
        </div>
        <button 
          onClick={() => fetchCheques(pagination.page)} 
          className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
              <th className="px-8 py-5 font-black">Issue Date</th>
              <th className="px-8 py-5 font-black">Matched Date</th>
              <th className="px-8 py-5 font-black">Cheque No</th>
              <th className="px-8 py-5 font-black">Description</th>
              <th className="px-8 py-5 font-black text-right">Amount</th>
              <th className="px-8 py-5 font-black text-center">Status</th>
              <th className="px-8 py-5 font-black text-right">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Records...</p>
                  </div>
                </td>
              </tr>
            ) : cheques.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                      <Search className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight">No Records Available</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Start by adding a new cheque entry</p>
                  </div>
                </td>
              </tr>
            ) : cheques.map((cheque) => (
              <tr key={cheque._id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-500">{new Date(cheque.issueDate).toLocaleDateString()}</td>
                <td className="px-8 py-5 whitespace-nowrap text-emerald-600 font-black">
                  {cheque.bsDate ? new Date(cheque.bsDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-8 py-5 font-mono font-black text-slate-400 group-hover:text-slate-900 transition-colors">{cheque.chequeNo}</td>
                <td className="px-8 py-5 max-w-[250px] truncate font-bold text-slate-500">{cheque.description}</td>
                <td className="px-8 py-5 font-black text-right text-slate-900 tracking-tighter text-sm">
                  {cheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 text-center">{getStatusBadge(cheque.status)}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedChequeId(cheque._id)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                      Audit
                    </button>
                    {cheque.status !== 'UNCASHED' && (
                      <button 
                        onClick={() => setResettingChequeId(cheque._id)}
                        className="px-4 py-2 bg-white border border-amber-200 text-amber-600 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cheques.length > 0 && (
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30">
          <Pagination 
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalEntries={pagination.total}
            pageSize={pagination.limit}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {selectedChequeId && (
        <ReconciliationDetailsModal 
          chequeId={selectedChequeId} 
          onClose={() => setSelectedChequeId(null)} 
          onRefresh={() => fetchCheques(pagination.page)}
        />
      )}

      <ConfirmAction
        isOpen={!!resettingChequeId}
        onClose={() => setResettingChequeId(null)}
        onConfirm={() => resettingChequeId && handleResetCheque(resettingChequeId)}
        title="Reset Lifecycle Status"
        description="Proceed with reverting this cheque to unchased status? This will break all current reconciliation links."
        confirmText="Confirm Reset"
        variant="destructive"
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
