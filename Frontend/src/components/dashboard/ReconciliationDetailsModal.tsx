import { useState, useEffect } from 'react';
import { X, CheckCircle, Info, User, Calendar, Hash, CreditCard, AlertCircle, Search, ArrowRight, DollarSign, AlignLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { ConfirmAction } from '../ui/ConfirmAction';

interface ReconciliationDetailsModalProps {
  chequeId: string;
  onClose: () => void;
}

export default function ReconciliationDetailsModal({ chequeId, onClose }: ReconciliationDetailsModalProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cheque, setCheque] = useState<any>(null);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  
  // Custom dialog states
  const [confirmMatchId, setConfirmMatchId] = useState<string | null>(null);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive", onConfirm?: () => void } | null>(null);

  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default", onConfirm?: () => void) => {
    setAlertConfig({ isOpen: true, title, description, variant, onConfirm });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const recData = await api.getReconciliationDetails(chequeId);
        setData(recData);
        setCheque(recData.chequeId);
      } catch (err: any) {
        try {
          const found = await api.getChequeById(chequeId);
          if (found) {
            setCheque(found);
            if (found.status === 'UNCASHED' || found.status === 'UNRECONCILED') {
              setError(found.status === 'UNCASHED' ? 'UNCASHED_INFO' : 'UNRECONCILED_INFO');
              try {
                const matches = await api.getPotentialMatches(chequeId);
                setPotentialMatches(matches);
              } catch (matchErr) {
                console.error('Failed to fetch potential matches:', matchErr);
              }
            } else {
              setError('No reconciliation record found for this cashed cheque.');
            }
          } else {
            setError('Cheque not found.');
          }
        } catch (innerErr: any) {
          setError(err.response?.data?.message || 'Failed to load details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chequeId]);

  const handleManualMatch = async (transactionId: string) => {
    setIsMatching(true);
    try {
      await api.manualReconcile(chequeId, transactionId);
      showAlert('Success', 'Reconciliation successful!', 'default', () => {
        onClose();
        window.location.reload();
      });
    } catch (err: any) {
      showAlert('Error', err.response?.data?.message || 'Failed to reconcile.', 'destructive');
    } finally {
      setIsMatching(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await api.markUnchased(chequeId);
      showAlert('Success', 'Cheque unlinked successfully.', 'default', () => {
        onClose();
        window.location.reload();
      });
    } catch (err) {
      showAlert('Error', 'Failed to unlink cheque.', 'destructive');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-r-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Fetching details...</p>
        </div>
      </div>
    );
  }

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
    if (!fields.includes('CHEQUE_NO') && cheque?.description && data.transactionId?.description) {
      const cDesc = cheque.description.toLowerCase().replace(/\s+/g, ' ').trim();
      const tDesc = data.transactionId.description.toLowerCase().replace(/\s+/g, ' ').trim();
      if (cDesc.length >= 3 && tDesc.length >= 3 && (cDesc.includes(tDesc) || tDesc.includes(cDesc))) {
        fields.push('DESCRIPTION');
      }
    }
    return fields;
  };

  const effectiveMatchedFields = getEffectiveMatchedFields();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden relative my-8">
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center text-white ${isUnlinked ? (error === 'UNRECONCILED_INFO' ? 'bg-amber-600' : 'bg-slate-600') : 'bg-indigo-600'}`}>
          <div className="flex items-center gap-2">
            {!isUnlinked ? <CheckCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            <h2 className="text-lg font-bold">
              {!isUnlinked ? 'Reconciliation Details' : (error === 'UNRECONCILED_INFO' ? 'Unreconciled Cheque (Potential Matches Found)' : 'Uncashed Cheque Info')}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && !isUnlinked && !cheque ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
              <Info className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Section */}
              {data ? (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><User className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Reconciled By</p>
                      <p className="font-semibold text-slate-700">{data.reconciledBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Calendar className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Reconciled At</p>
                      <p className="font-semibold text-slate-700">{new Date(data.reconciledAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="sm:col-span-2 pt-3 border-t border-indigo-200 mt-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Verification Criteria</p>
                    <div className="flex flex-wrap gap-2">
                      {effectiveMatchedFields.length > 0 ? (
                        effectiveMatchedFields.map((field: string) => (
                          <span key={field} className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 uppercase tracking-tight flex items-center gap-1">
                            {field === 'AMOUNT' && <DollarSign className="h-2.5 w-2.5" />}
                            {field === 'CHEQUE_NO' && <Hash className="h-2.5 w-2.5" />}
                            {field === 'DESCRIPTION' && <AlignLeft className="h-2.5 w-2.5" />}
                            {field === 'MANUAL_VERIFICATION' && <User className="h-2.5 w-2.5" />}
                            {field.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200 uppercase tracking-tight">
                          {data?.matchType === 'AUTO' ? 'SYSTEM MATCHED' : 'MANUALLY VERIFIED'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Unlink Action */}
                  <div className="sm:col-span-2 pt-3 flex justify-end">
                    <button
                      onClick={() => setIsUnlinkConfirmOpen(true)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-1 transition-colors px-2 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-100"
                    >
                      <AlertCircle className="h-3 w-3" /> Unlink & Reset Cheque
                    </button>
                  </div>
                </div>
              ) : isUnlinked ? (
                <div className={`${error === 'UNRECONCILED_INFO' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4 flex items-start gap-3`}>
                  <AlertCircle className={`h-5 w-5 ${error === 'UNRECONCILED_INFO' ? 'text-amber-600' : 'text-slate-600'} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-bold ${error === 'UNRECONCILED_INFO' ? 'text-amber-800' : 'text-slate-800'}`}>
                      {error === 'UNRECONCILED_INFO' ? 'Potential Matches Found' : 'No Matches Found Yet'}
                    </p>
                    <p className={`text-xs ${error === 'UNRECONCILED_INFO' ? 'text-amber-700' : 'text-slate-700'}`}>
                      {error === 'UNRECONCILED_INFO' 
                        ? 'This cheque has bank transactions with the same amount but different identifiers. Review the potential matches below.'
                        : 'This cheque is currently marked as UNCASHED. No bank statement records were found with this amount yet.'}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Cheque & Bank Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cheque Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> Cheque Details
                  </h3>
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 overflow-hidden relative">
                    <div className={`flex justify-between text-sm items-center p-1 rounded-md transition-colors ${effectiveMatchedFields.includes('CHEQUE_NO') ? 'bg-green-50 border border-green-100' : ''}`}>
                      <span className="text-slate-500 flex items-center gap-1">
                        {effectiveMatchedFields.includes('CHEQUE_NO') ? <Hash className="h-3.5 w-3.5 text-green-600" /> : <Hash className="h-3.5 w-3.5 text-slate-400 opacity-40" />}
                        Cheque No:
                      </span> 
                      <span className="font-mono font-bold text-slate-800">{cheque?.chequeNo}</span>
                    </div>
                    <div className="flex justify-between text-sm p-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 opacity-40" />
                        Issue Date:
                      </span> 
                      <span className="font-medium text-slate-700">{cheque ? new Date(cheque.issueDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className={`flex justify-between text-sm items-center p-1 rounded-md transition-colors ${effectiveMatchedFields.includes('AMOUNT') ? 'bg-green-50 border border-green-100' : ''}`}>
                      <span className="text-slate-500 flex items-center gap-1">
                        {effectiveMatchedFields.includes('AMOUNT') ? <DollarSign className="h-3.5 w-3.5 text-green-600" /> : <DollarSign className="h-3.5 w-3.5 text-slate-400 opacity-40" />}
                        Amount:
                      </span> 
                      <span className="font-bold text-green-600 text-lg">{cheque?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className={`pt-2 border-t border-slate-200 p-1 rounded-md transition-colors ${effectiveMatchedFields.includes('DESCRIPTION') ? 'bg-green-50 border border-green-100' : ''}`}>
                      <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold flex items-center gap-1">
                        {effectiveMatchedFields.includes('DESCRIPTION') ? <AlignLeft className="h-3 w-3 text-green-600" /> : <AlignLeft className="h-3 w-3 text-slate-400 opacity-40" />}
                        Internal Description
                      </p>
                      <p className="text-sm text-slate-600 italic">{cheque?.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Record / Potential Matches */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div> {data ? 'Matched Bank Record' : 'Reconciliation Action'}
                  </h3>
                  
                  {data ? (
                    <div className="space-y-3 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                      <div className="flex justify-between text-sm p-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 opacity-40" />
                          Transaction Date:
                        </span> 
                        <span className="font-medium text-slate-700">{new Date(data.transactionId?.transactionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm p-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 opacity-40" />
                          Value Date:
                        </span> 
                        <span className="font-medium text-slate-700">{new Date(data.transactionId?.valueDate).toLocaleDateString()}</span>
                      </div>
                      <div className={`flex justify-between text-sm items-center p-1 rounded-md transition-colors ${effectiveMatchedFields.includes('CHEQUE_NO') ? 'bg-green-50 border border-green-100' : ''}`}>
                        <span className="text-slate-500 flex items-center gap-1">
                          {effectiveMatchedFields.includes('CHEQUE_NO') ? <Hash className="h-3.5 w-3.5 text-green-600" /> : <Hash className="h-3.5 w-3.5 text-slate-400 opacity-40" />}
                          Ref No:
                        </span> 
                        <span className="font-mono text-slate-700">{data.transactionId?.refNo || 'N/A'}</span>
                      </div>
                      <div className={`flex justify-between text-sm p-1 rounded-md transition-colors ${effectiveMatchedFields.includes('DESCRIPTION') ? 'bg-green-50 border border-green-100' : ''}`}>
                        <span className="text-slate-500 flex items-center gap-1">
                          {effectiveMatchedFields.includes('DESCRIPTION') ? <AlignLeft className="h-3.5 w-3.5 text-green-600" /> : <AlignLeft className="h-3.5 w-3.5 text-slate-400 opacity-40" />}
                          Description:
                        </span> 
                        <span className="font-medium text-slate-700 max-w-[150px] truncate" title={data.transactionId?.description}>{data.transactionId?.description || 'N/A'}</span>
                      </div>
                      <div className={`flex justify-between text-sm items-center p-1 rounded-md transition-colors ${effectiveMatchedFields.includes('AMOUNT') ? 'bg-green-50 border border-green-100' : ''}`}>
                        <span className="text-slate-500 flex items-center gap-1">
                          {effectiveMatchedFields.includes('AMOUNT') ? <DollarSign className="h-3.5 w-3.5 text-green-600" /> : <DollarSign className="h-3.5 w-3.5 text-slate-400 opacity-40" />}
                          {data.transactionId?.debit ? 'Debit:' : 'Credit:'}
                        </span> 
                        <span className={`font-bold ${data.transactionId?.debit ? 'text-red-600' : 'text-green-600'}`}>
                          {(data.transactionId?.debit || data.transactionId?.credit)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center pt-1 border-t border-slate-100 p-1">
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-slate-400 opacity-40" />
                          Balance:
                        </span> 
                        <span className="font-bold text-slate-800">{data.transactionId?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full justify-center items-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                      <Search className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-500 font-medium">
                        {isUnlinked && potentialMatches.length > 0 
                          ? `${potentialMatches.length} matching amount(s) found in bank statements.`
                          : 'No matching records found to show here.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Potential Matches Section */}
              {isUnlinked && potentialMatches.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Search className="h-4 w-4 text-indigo-500" /> Potential Bank Statement Matches
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Review Suggested</span>
                  </div>
                  
                  <div className="grid gap-3">
                    {potentialMatches.map((match) => {
                      const chequeDesc = (cheque?.description || '').toLowerCase().replace(/\s+/g, ' ').trim();
                      const matchDesc = (match.description || '').toLowerCase().replace(/\s+/g, ' ').trim();
                      const isDescClose = chequeDesc.length >= 3 && matchDesc.length >= 3 && (matchDesc.includes(chequeDesc) || chequeDesc.includes(matchDesc));

                      return (
                        <div 
                          key={match._id} 
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${isDescClose ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-200'}`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{new Date(match.transactionDate).toLocaleDateString()}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Ref: {match.refNo || 'N/A'}</span>
                              {isDescClose && (
                                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                  <Info className="h-3 w-3" /> Description Similarity
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-1 italic" title={match.description}>{match.description}</p>
                            <div className="flex gap-4 text-[10px] font-medium text-slate-400">
                              <span>Amount: <span className="text-slate-700 font-bold">{(match.debit || match.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
                              <span>Account: <span className="text-slate-700">{match.accountNo || 'N/A'}</span></span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setConfirmMatchId(match._id)}
                            disabled={isMatching}
                            className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {isMatching ? 'Matching...' : (
                              <>
                                Match & Reconcile <ArrowRight className="h-3 w-3" />
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

          <div className="mt-8 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 italic font-medium">
              Powered by Finance Wing Auto-Reconciliation Engine v2.0
            </p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all shadow-lg active:scale-95"
            >
              Close Details
            </button>
          </div>
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
}
