import { useState } from 'react';
import { CheckSquare, AlertCircle, Search } from 'lucide-react';
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
    <div className="glass-card rounded-[2rem] overflow-hidden shadow-2xl border-0 mt-12 animate-fade-in-up relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-4 font-heading">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          Action <span className="text-indigo-600">Workspace</span>
        </h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Match:</span>
          <span className="text-xs font-bold text-indigo-600">{selectedMatchId ? "READY" : "WAITING..."}</span>
        </div>
      </div>
      
      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Selected Cheque Details Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-[0.2em] mb-6">Source Cheque</h4>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Cheque Number</p>
                <p className="text-xl font-black font-mono tracking-tighter">{selectedCheque.chequeNo}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-extrabold tracking-tighter">
                  {selectedCheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-indigo-200">Issue Date:</span>
                  <span>{new Date(selectedCheque.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-indigo-200">Status:</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{selectedCheque.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Possible Matches Table */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Potential Bank Records</h4>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">Best Matches Only</span>
          </div>
          <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/30 flex-1 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Select</th>
                    <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-widest">Ref No</th>
                    <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-5 py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {possibleMatches.map(match => {
                    const amount = match.debit || match.credit;
                    const isPerfectMatch = amount === selectedCheque.amount;
                    
                    return (
                      <tr 
                        key={match._id} 
                        className={`group hover:bg-white cursor-pointer transition-all duration-200 ${selectedMatchId === match._id ? 'bg-white shadow-lg' : ''}`} 
                        onClick={() => setSelectedMatchId(match._id)}
                      >
                        <td className="px-5 py-5 text-center">
                          <input 
                            type="radio" 
                            name="match" 
                            className="h-4 w-4 accent-indigo-600 transition-transform group-hover:scale-125" 
                            checked={selectedMatchId === match._id}
                            onChange={() => setSelectedMatchId(match._id)}
                            disabled={match.status === 'RECONCILED'}
                          />
                        </td>
                        <td className="px-5 py-5 whitespace-nowrap font-medium text-slate-600">{new Date(match.transactionDate).toLocaleDateString()}</td>
                        <td className="px-5 py-5 font-mono font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">{match.refNo}</td>
                        <td className="px-5 py-5 max-w-[200px] truncate text-slate-500 font-medium" title={match.description}>{match.description}</td>
                        <td className="px-5 py-5 text-right font-black text-slate-900 tracking-tighter text-sm">
                          {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-5 text-center">
                          {isPerfectMatch ? (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight">Exact Amount</span>
                          ) : (
                            <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight">Amount Mismatch</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {possibleMatches.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="h-8 w-8 text-slate-200" />
                          <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">No matching bank records found for this cheque</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-end">
            <button 
              onClick={handleMarkUnchased}
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <AlertCircle className="h-4 w-4" /> Mark as Unchased
            </button>
            <button 
              onClick={handleReconcile}
              className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black tracking-tight hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-3 shadow-xl shadow-indigo-200"
            >
              <CheckSquare className="h-5 w-5" /> RECONCILE NOW
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
