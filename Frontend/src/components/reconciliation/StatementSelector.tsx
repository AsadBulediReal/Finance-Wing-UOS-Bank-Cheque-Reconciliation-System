import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import Pagination from '../ui/Pagination';

interface StatementSelectorProps {
  onTransactionsLoad: (txs: any[]) => void;
  refreshKey?: number;
  autoSearchAmount?: number | null;
}

export default function StatementSelector({ onTransactionsLoad, refreshKey, autoSearchAmount }: StatementSelectorProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    valueDateFrom: '',
    valueDateTo: '',
    refNo: '',
    accountNo: '',
    description: '',
    debit: '',
    credit: '',
    amount: '',
    balance: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  });

  const fetchTransactions = (page = 1, limit = pagination.limit) => {
    setIsLoading(true);
    // Remove empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    const hasFilters = Object.keys(cleanFilters).length > 0;
    const params: any = { ...cleanFilters, page, limit };
    if (!hasFilters) {
      setTransactions([]);
      setPagination(prev => ({ ...prev, page: 1, totalPages: 1, total: 0 }));
      onTransactionsLoad([]);
      setIsLoading(false);
      return;
    }

    api.getAllTransactions(params).then(res => {
      setTransactions(res.data);
      setPagination({
        page: res.page,
        totalPages: res.totalPages,
        total: res.total,
        limit: limit
      });
      onTransactionsLoad(res.data);
    }).catch(err => console.error(err)).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // Only auto-fetch if we already have some search results or filters, 
    // or if we're refreshing after an action.
    // However, if the user wants "No records without searching", 
    // we should only fetch if filters are not empty or if it's a forced refresh from an action.
    if (refreshKey && refreshKey > 0) {
      fetchTransactions(1);
    }
  }, [refreshKey]);

  useEffect(() => {
    if (autoSearchAmount !== undefined && autoSearchAmount !== null) {
      setFilters(prev => ({ ...prev, amount: autoSearchAmount.toString() }));
      // Small timeout to ensure state is updated
      setTimeout(() => fetchTransactions(1), 0);
    }
  }, [autoSearchAmount]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    const reset = {
      dateFrom: '', dateTo: '', valueDateFrom: '', valueDateTo: '', refNo: '', accountNo: '',
      description: '', debit: '', credit: '', amount: '', balance: ''
    };
    setFilters(reset);
    setTransactions([]);
    setPagination(prev => ({ ...prev, page: 1, totalPages: 1, total: 0 }));
    onTransactionsLoad([]);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTransactions(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchTransactions(1, newSize);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-full min-h-[650px] shadow-premium transition-all duration-500 hover:shadow-2xl border-t-0">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-heading">Bank Record Selector</h3>
        </div>
        {isLoading && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-r-transparent"></div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <div className="text-sm mb-6 shrink-0">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 ml-1">Search & Filter Records</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ref No</label>
              <input
                type="text"
                name="refNo"
                value={filters.refNo}
                onChange={handleFilterChange}
                placeholder="Ex: BNK-001"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
              <input
                type="text"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
                placeholder="Full transaction description"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Debit</label>
              <input
                type="number"
                name="debit"
                value={filters.debit}
                onChange={handleFilterChange}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Credit</label>
              <input
                type="number"
                name="credit"
                value={filters.credit}
                onChange={handleFilterChange}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => fetchTransactions(1)}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> Search Records
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col mb-3 shrink-0 gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Search Results ({pagination.total})</label>
            </div>
            {transactions.some(tx => tx.status === 'RECONCILED') && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-3 font-semibold animate-pulse shadow-sm">
                <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <span>THE SEARCHED RECORD IS ALREADY RECONCILED</span>
              </div>
            )}
          </div>
          <div className="border border-slate-100 rounded-2xl overflow-hidden flex-1 flex flex-col bg-white/50">
            <div className="overflow-y-auto flex-1 min-h-[200px]">
              <table className="w-full text-left text-[11px] relative">
                <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-3 py-3 font-bold text-slate-400 uppercase tracking-widest">Ref No</th>
                    <th className="px-3 py-3 font-bold text-slate-400 uppercase tracking-widest">Desc</th>
                    <th className="px-3 py-3 font-bold text-slate-400 uppercase tracking-widest text-right">Debit</th>
                    <th className="px-3 py-3 font-bold text-slate-400 uppercase tracking-widest text-right">Credit</th>
                    <th className="px-3 py-3 font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.filter(tx => tx.status !== 'RECONCILED').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                            <Search className="h-6 w-6 text-slate-300" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{transactions.some(tx => tx.status === 'RECONCILED') ? "No Unreconciled Records" : "No Records Loaded"}</p>
                            <p className="text-[10px] mt-1 text-slate-400 uppercase font-bold tracking-widest">Search above to load records</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.filter(tx => tx.status !== 'RECONCILED').map(tx => (
                    <tr key={tx._id} className="hover:bg-amber-50/30 transition-colors duration-200 group">
                      <td className="px-3 py-4 whitespace-nowrap font-medium text-slate-600">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                      <td className="px-3 py-4 font-mono font-bold text-slate-500">{tx.refNo}</td>
                      <td className="px-3 py-4 truncate max-w-[100px] text-slate-600" title={tx.description}>{tx.description}</td>
                      <td className="px-3 py-4 text-right font-bold text-rose-600">{tx.debit ? tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-3 py-4 text-right font-bold text-emerald-600">{tx.credit ? tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-3 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-tighter ${tx.status === 'RECONCILED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-2">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  pageSize={pagination.limit}
                  onPageSizeChange={handlePageSizeChange}
                  className="py-1"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
