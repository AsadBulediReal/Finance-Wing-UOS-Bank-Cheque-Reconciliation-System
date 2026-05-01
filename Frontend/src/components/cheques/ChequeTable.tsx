import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Pagination from '../ui/Pagination';
import ReconciliationDetailsModal from '../dashboard/ReconciliationDetailsModal';
import { ConfirmAction } from '../ui/ConfirmAction';

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
    } catch (err) {
      showAlert('Error', 'Failed to update cheque status.', 'destructive');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CASHED': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md uppercase">CASHED</span>;
      case 'UNCHASED': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-md uppercase">UNCHASED</span>;
      case 'UNRECONCILED': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md uppercase">UNRECONCILED</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Cheque List</h3>
        <button onClick={() => fetchCheques(pagination.page)} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-sm hover:bg-indigo-100">Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-3 font-medium">Select</th>
              <th className="px-6 py-3 font-medium">Issue Date</th>
              <th className="px-6 py-3 font-medium">Transaction Date</th>
              <th className="px-6 py-3 font-medium">Cheque No</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <span className="ml-3 text-slate-500">Loading cheques...</span>
                </td>
              </tr>
            ) : cheques.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-4 text-slate-500">No cheques found.</td></tr>
            ) : cheques.map((cheque) => (
              <tr key={cheque._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(cheque.issueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-indigo-600 font-medium">
                  {cheque.bsDate ? new Date(cheque.bsDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 font-mono text-slate-600">{cheque.chequeNo}</td>
                <td className="px-6 py-4">{cheque.description}</td>
                <td className="px-6 py-4 font-medium text-right">{cheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-center">{getStatusBadge(cheque.status)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setSelectedChequeId(cheque._id)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium text-xs transition-colors"
                    >
                      View Details
                    </button>
                    {cheque.status !== 'UNCASHED' && (
                      <button 
                        onClick={() => setResettingChequeId(cheque._id)}
                        className="px-3 py-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-md font-medium text-xs transition-colors"
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
      <div className="border-t border-slate-200 bg-slate-50 px-4">
        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          totalEntries={pagination.total}
          pageSize={pagination.limit}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {selectedChequeId && (
        <ReconciliationDetailsModal 
          chequeId={selectedChequeId} 
          onClose={() => setSelectedChequeId(null)} 
        />
      )}

      <ConfirmAction
        isOpen={!!resettingChequeId}
        onClose={() => setResettingChequeId(null)}
        onConfirm={() => resettingChequeId && handleResetCheque(resettingChequeId)}
        title="Reset Cheque Status"
        description="Are you sure you want to mark this cheque as unchased? This will remove its cashed status and free up any linked bank records."
        confirmText="Reset Status"
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
