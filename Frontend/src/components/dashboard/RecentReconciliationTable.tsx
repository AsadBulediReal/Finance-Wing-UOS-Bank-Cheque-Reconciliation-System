import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import ReconciliationDetailsModal from './ReconciliationDetailsModal';

export default function RecentReconciliationTable() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(null);

  useEffect(() => {
    // Show the 10 most recently updated/reconciled cheques
    api.getCheques({ limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' })
      .then(res => setCheques(res.data))
      .catch(err => console.error(err));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CASHED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md uppercase tracking-wider">CASHED</span>;
      case 'UNCHASED':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-md uppercase tracking-wider">UNCHASED</span>;
      case 'UNRECONCILED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md uppercase tracking-wider">UNRECONCILED</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Recent Reconciliation List</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
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
            {cheques.map((cheque) => (
              <tr key={cheque._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(cheque.issueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-indigo-600 font-medium">
                  {cheque.bsDate ? new Date(cheque.bsDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 font-mono text-slate-600">{cheque.chequeNo}</td>
                <td className="px-6 py-4">{cheque.description}</td>
                <td className="px-6 py-4 font-medium text-right">{cheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-center">{getStatusBadge(cheque.status)}</td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setSelectedChequeId(cheque._id)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium text-xs transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedChequeId && (
        <ReconciliationDetailsModal 
          chequeId={selectedChequeId} 
          onClose={() => setSelectedChequeId(null)} 
        />
      )}
    </div>
  );
}
