import { useState } from 'react';
import { CheckSquare, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { ConfirmAction } from '../ui/ConfirmAction';

interface MatchWorkspaceProps {
  selectedCheque: any;
  possibleMatches: any[];
  onReconciled: () => void;
}

export default function MatchWorkspace({ selectedCheque, possibleMatches, onReconciled }: MatchWorkspaceProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive" } | null>(null);

  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertConfig({ isOpen: true, title, description, variant });
  };

  const handleReconcile = async () => {
    if (!selectedMatchId) {
      showAlert('Required', 'Please select a matching transaction first.', 'destructive');
      return;
    }

    try {
      await api.manualReconcile(selectedCheque._id, selectedMatchId);
      showAlert('Success', 'Reconciliation successful!');
      onReconciled();
    } catch (error: any) {
      showAlert('Error', `Error: ${error.response?.data?.message || error.message}`, 'destructive');
    }
  };

  const handleMarkUnchased = async () => {
    try {
      await api.markUnchased(selectedCheque._id);
      showAlert('Success', 'Cheque marked as unchased.');
      onReconciled();
    } catch (error: any) {
      showAlert('Error', `Error: ${error.response?.data?.message || error.message}`, 'destructive');
    }
  };

  if (!selectedCheque) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-indigo-200 border-t-4 border-t-indigo-500 mt-6">
      <div className="p-4 border-b border-slate-200 bg-indigo-50">
        <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <CheckSquare className="h-5 w-5" /> Match & Reconcile
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Cheque */}
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 h-fit">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Selected Cheque</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Issue Date:</span> <span className="font-medium text-slate-800">{new Date(selectedCheque.issueDate).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Cheque No:</span> <span className="font-mono text-slate-800">{selectedCheque.chequeNo}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Description:</span> <span className="font-medium text-slate-800 truncate max-w-[150px]" title={selectedCheque.description}>{selectedCheque.description}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Amount:</span> <span className="font-medium text-slate-800">{selectedCheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between pt-2 border-t border-slate-200"><span className="text-slate-500">Status:</span> <span className="font-bold text-red-600 uppercase">{selectedCheque.status}</span></div>
          </div>
        </div>

        {/* Possible Matches */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Possible Matches from Bank Records</h4>
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-medium">Select</th>
                  <th className="px-4 py-2 font-medium">Transaction Date</th>
                  <th className="px-4 py-2 font-medium">Value Date</th>
                  <th className="px-4 py-2 font-medium">Transaction Reference No</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium text-right">Debit</th>
                  <th className="px-4 py-2 font-medium text-right">Credit</th>
                  <th className="px-4 py-2 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {possibleMatches.map(match => (
                  <tr key={match._id} className={`hover:bg-slate-50 cursor-pointer ${selectedMatchId === match._id ? 'bg-indigo-50' : ''}`} onClick={() => setSelectedMatchId(match._id)}>
                    <td className="px-4 py-3">
                      <input 
                        type="radio" 
                        name="match" 
                        className="accent-indigo-600" 
                        checked={selectedMatchId === match._id}
                        onChange={() => setSelectedMatchId(match._id)}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(match.transactionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{match.valueDate ? new Date(match.valueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{match.refNo}</td>
                    <td className="px-4 py-3 truncate max-w-[150px]" title={match.description}>{match.description}</td>
                    <td className="px-4 py-3 text-right">{match.debit ? match.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                    <td className="px-4 py-3 text-right">{match.credit ? match.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium">{match.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {possibleMatches.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No matching amounts found in the database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={handleReconcile}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" /> Reconcile Selected Match
            </button>
            <button 
              onClick={handleMarkUnchased}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" /> Mark as Unchased
            </button>
          </div>
        </div>
      </div>
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
