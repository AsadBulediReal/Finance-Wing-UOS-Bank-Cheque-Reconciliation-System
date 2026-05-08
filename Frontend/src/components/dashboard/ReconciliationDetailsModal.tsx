import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Info, User, Calendar, Hash, CreditCard, AlertCircle, Search, ArrowRight, DollarSign, AlignLeft, CheckSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { ConfirmAction } from '../ui/ConfirmAction';

interface ReconciliationDetailsModalProps {
  chequeId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ReconciliationDetailsModal({ chequeId, onClose, onRefresh }: ReconciliationDetailsModalProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cheque, setCheque] = useState<any>(null);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [confirmMatchId, setConfirmMatchId] = useState<string | null>(null);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive", onConfirm?: () => void } | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const recData = await api.getReconciliationDetails(chequeId);
        setData(recData);
        setCheque(recData.chequeId);
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            const chequeData = await api.getChequeById(chequeId);
            setCheque(chequeData);
            setData(null);
            
            if (chequeData.status === 'UNRECONCILED' || chequeData.status === 'UNCASHED') {
              setError(chequeData.status === 'UNCASHED' ? 'UNCASHED_INFO' : 'UNRECONCILED_INFO');
              const matches = await api.getPotentialMatches(chequeId);
              setPotentialMatches(matches);
            } else {
              setError('Status context mismatch.');
            }
          } catch (cErr: any) {
            setError('Could not retrieve cheque data.');
          }
        } else {
          setError(err.response?.data?.message || 'Error fetching details');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [chequeId]);

  const handleManualMatch = async (transactionId: string) => {
    setIsMatching(true);
    try {
      await api.manualReconcile(chequeId, transactionId);
      setAlertConfig({
        isOpen: true,
        title: 'Success',
        description: 'Cheque has been manually reconciled successfully.',
        onConfirm: () => {
          onClose();
          if (onRefresh) onRefresh();
          else window.location.reload();
        }
      });
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reconcile',
        variant: 'destructive'
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await api.markUnchased(chequeId);
      setAlertConfig({
        isOpen: true,
        title: 'Unlinked Successfully',
        description: 'The reconciliation link has been removed and the records have been reset.',
        onConfirm: () => {
          onClose();
          if (onRefresh) onRefresh();
          else window.location.reload();
        }
      });
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        title: 'Error',
        description: err.response?.data?.message || 'Failed to unlink',
        variant: 'destructive'
      });
    }
  };

  const isUnlinked = error === 'UNCASHED_INFO' || error === 'UNRECONCILED_INFO';

  const getEffectiveMatchedFields = () => {
    if (data?.matchedFields && data.matchedFields.length > 0) return data.matchedFields;
    if (!data || isUnlinked) return [];
    
    const fields = ['AMOUNT'];
    if (cheque?.chequeNo) {
      const refNo = (data.transactionId?.refNo || '').toLowerCase();
      const transDesc = (data.transactionId?.description || '').toLowerCase();
      const cNo = cheque.chequeNo.toLowerCase();
      if (refNo.includes(cNo) || transDesc.includes(cNo)) fields.push('CHEQUE_NO');
    }
    return fields;
  };

  const effectiveMatchedFields = getEffectiveMatchedFields();

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-hidden">
      {/* Heavy backdrop for whole screen coverage */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-0 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in relative z-10 bg-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Sticky Header */}
        <div className={`px-6 sm:px-10 py-6 flex justify-between items-center relative z-30 shrink-0 border-b border-slate-100 ${isUnlinked ? (error === 'UNRECONCILED_INFO' ? 'bg-amber-500/10' : 'bg-slate-500/10') : 'bg-indigo-600/10'}`}>
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shadow-lg ${!isUnlinked ? 'bg-indigo-600 text-white shadow-indigo-200' : (error === 'UNRECONCILED_INFO' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-slate-600 text-white shadow-slate-200')}`}>
              {!isUnlinked ? <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : <Info className="h-5 w-5 sm:h-6 sm:w-6" />}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                {!isUnlinked ? 'Audit Verification' : (error === 'UNRECONCILED_INFO' ? 'Reconciliation Review' : 'Voucher Details')}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {!isUnlinked ? 'Confirmed Transaction Record' : 'Manual Intervention Required'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm border border-slate-100 hover:scale-110 active:scale-95">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Scrollable Content area */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : error && !isUnlinked && !cheque ? (
            <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl flex items-center gap-4 text-rose-700 animate-fade-in-up">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest mb-1">Critical Error</p>
                <p className="text-sm font-bold opacity-80">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              {/* Amount Mismatch Warning */}
              {data && cheque && (data.transactionId?.debit || data.transactionId?.credit) !== cheque.amount && (
                <div className="bg-rose-600 border border-rose-400 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-pulse shadow-xl shadow-rose-200 text-white">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner backdrop-blur-md">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-lg font-black tracking-tight">CRITICAL AMOUNT MISMATCH</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Manual verification recommended immediately</p>
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10 text-center sm:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Discrepancy</p>
                    <p className="text-xl font-black tracking-tighter">
                      {Math.abs(cheque.amount - (data.transactionId?.debit || data.transactionId?.credit)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Section */}
              {data ? (
                <div className="bg-slate-50/80 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm relative group">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-50 transition-transform group-hover:scale-110 duration-500">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Authorized By</p>
                        <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{data.reconciledBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-50 transition-transform group-hover:scale-110 duration-500">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Execution Date</p>
                        <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{new Date(data.reconciledAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 ml-1">Validation Metadata</p>
                      <div className="flex flex-wrap gap-2">
                        {effectiveMatchedFields.length > 0 ? (
                          effectiveMatchedFields.map((field: string) => (
                            <span key={field} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                              <CheckCircle className="h-3 w-3" />
                              {field.replace('_', ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl border border-blue-100 uppercase tracking-widest shadow-sm">
                            {data?.matchType === 'AUTO' ? 'SYSTEM AUTOMATED' : 'MANUAL OVERRIDE'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsUnlinkConfirmOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 text-[10px] font-black text-rose-600 bg-white hover:bg-rose-50 border border-rose-100 rounded-xl uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-rose-100 hover:-translate-y-0.5 active:scale-95"
                    >
                      <X className="h-3.5 w-3.5 rotate-45" /> Unlink & Rollback
                    </button>
                  </div>
                </div>
              ) : isUnlinked ? (
                <div className={`${error === 'UNRECONCILED_INFO' ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100'} border rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 animate-fade-in-up shadow-sm`}>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${error === 'UNRECONCILED_INFO' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <div className="pt-1">
                    <p className={`text-lg font-black tracking-tight ${error === 'UNRECONCILED_INFO' ? 'text-amber-900' : 'text-slate-900'}`}>
                      {error === 'UNRECONCILED_INFO' ? 'Ambiguous Record Detected' : 'Pending Verification'}
                    </p>
                    <p className={`text-sm font-medium mt-1 leading-relaxed ${error === 'UNRECONCILED_INFO' ? 'text-amber-700/80' : 'text-slate-600'}`}>
                      {error === 'UNRECONCILED_INFO' 
                        ? 'System found multiple bank transactions with identical amounts but mismatched references. Manual selection is mandatory.'
                        : 'This voucher is currently pending in the ledger. No corresponding bank activity has been detected for the specified amount.'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Cheque & Bank Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                {/* Cheque Info */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3 px-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Ledger Instrument
                  </h3>
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 space-y-5 shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150"></div>
                    
                    <div className="flex justify-between items-center group/item transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50 transition-colors">
                          <Hash className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial No</span>
                      </div>
                      <span className="text-base sm:text-lg font-mono font-black text-slate-900">{cheque?.chequeNo || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center group/item transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50 transition-colors">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Date</span>
                      </div>
                      <span className="text-sm font-black text-slate-700">{cheque ? new Date(cheque.issueDate).toLocaleDateString() : '-'}</span>
                    </div>

                    <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 group/amount">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settlement Value</span>
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <DollarSign className="h-3 w-3 text-emerald-600" />
                        </div>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tighter">
                        {cheque?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <AlignLeft className="h-3 w-3" /> Narration
                      </p>
                      <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-sm text-slate-600 font-bold italic leading-relaxed">
                        {cheque?.description || 'No system narration provided'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Record / Potential Matches */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3 px-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div> Bank Statement Activity
                  </h3>
                  
                  {data ? (
                    <div className="bg-amber-600 rounded-[2rem] p-6 sm:p-8 space-y-5 shadow-xl shadow-amber-100 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-150"></div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Record Date</span>
                        </div>
                        <span className="text-sm font-black text-white">{new Date(data.transactionId?.transactionDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                            <Hash className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Ref Index</span>
                        </div>
                        <span className="text-sm font-mono font-black text-white">{data.transactionId?.refNo || 'N/A'}</span>
                      </div>

                      <div className="p-5 sm:p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Statement Impact</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border ${data.transactionId?.debit ? 'bg-rose-500/20 text-rose-200 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'}`}>
                            {data.transactionId?.debit ? 'DEBIT' : 'CREDIT'}
                          </span>
                        </div>
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                          {(data.transactionId?.debit || data.transactionId?.credit)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Statement Balance</span>
                        </div>
                        <span className="text-lg font-black text-white tracking-tight">{data.transactionId?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full justify-center items-center p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center group">
                      <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                        <Search className="h-10 w-10 text-slate-200 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-sm font-black text-slate-800 tracking-tight mb-2">No Verified Link Found</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        {isUnlinked && potentialMatches.length > 0 
                          ? `${potentialMatches.length} matching candidates found`
                          : 'Awaiting bank synchronization'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Potential Matches Section */}
              {isUnlinked && potentialMatches.length > 0 && (
                <div className="space-y-6 pt-10 border-t border-slate-100">
                  <div className="flex justify-between items-end px-1">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Search className="h-5 w-5 text-amber-500" /> Resolution Candidates
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Found via Amount Matching Engine</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {potentialMatches.map((match) => {
                      const chequeDesc = (cheque?.description || '').toLowerCase().replace(/\s+/g, ' ').trim();
                      const matchDesc = (match.description || '').toLowerCase().replace(/\s+/g, ' ').trim();
                      const isDescClose = chequeDesc.length >= 3 && matchDesc.length >= 3 && (matchDesc.includes(chequeDesc) || chequeDesc.includes(matchDesc));

                      return (
                        <div 
                          key={match._id} 
                          className={`flex flex-col xl:flex-row items-start xl:items-center justify-between p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group/match ${isDescClose ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-slate-100'}`}
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Info</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900">{new Date(match.transactionDate).toLocaleDateString()}</span>
                                <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">#{match.refNo || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                Bank Narration
                                {isDescClose && <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-lg text-[8px] font-black tracking-[0.2em] animate-pulse">HIGH SIMILARITY</span>}
                              </p>
                              <p className="text-sm font-bold text-slate-600 italic line-clamp-1">{match.description || 'No narration'}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setConfirmMatchId(match._id)}
                            disabled={isMatching}
                            className="mt-6 xl:mt-0 xl:ml-8 w-full xl:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 hover:-translate-y-1 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                          >
                            {isMatching ? 'Processing...' : (
                              <>
                                Reconcile Link <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-6 relative z-30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
              <CheckSquare className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">
              Finance Wing Engine <span className="text-slate-300 mx-2">|</span> Systems v2.4
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
      
      {/* Custom Dialogs */}
      <ConfirmAction
        isOpen={!!confirmMatchId}
        onClose={() => setConfirmMatchId(null)}
        onConfirm={() => confirmMatchId && handleManualMatch(confirmMatchId)}
        title="Reconcile Transaction"
        description="Are you sure you want to reconcile this cheque with this bank transaction? This action will update the status of both records."
        confirmText="Match & Reconcile"
      />
      
      <ConfirmAction
        isOpen={isUnlinkConfirmOpen}
        onClose={() => setIsUnlinkConfirmOpen(false)}
        onConfirm={handleUnlink}
        title="Unlink & Reset Cheque"
        description="Are you sure you want to unlink this cheque from the bank record? The cheque will be marked as UNCASHED and the bank transaction will be freed."
        confirmText="Unlink Record"
        variant="destructive"
      />

      <ConfirmAction
        isOpen={!!alertConfig?.isOpen}
        onClose={() => setAlertConfig(null)}
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          setAlertConfig(null);
        }}
        title={alertConfig?.title || 'Notification'}
        description={alertConfig?.description || ''}
        confirmText="OK"
        showCancel={false}
        variant={alertConfig?.variant}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
}
