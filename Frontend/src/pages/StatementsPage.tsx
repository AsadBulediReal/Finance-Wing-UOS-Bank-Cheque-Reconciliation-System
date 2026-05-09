import { useState, useEffect } from 'react';
import UploadStatement from '../components/statements/UploadStatement';

import { UploadCloud, DownloadCloud, Search } from 'lucide-react';
import { api } from '../lib/api';
import Pagination from '../components/ui/Pagination';

export default function StatementsPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    valueDateFrom: '',
    valueDateTo: '',
    accountNo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = (page = 1, limit = pagination.limit) => {
    setIsLoading(true);
    const params = {
      ...filters,
      page,
      limit
    };

    api.getAllTransactions(params)
      .then(res => {
        setTransactions(res.data);
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
    fetchTransactions(1);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ search: '', dateFrom: '', dateTo: '', valueDateFrom: '', valueDateTo: '', accountNo: '' });
    fetchTransactions(1);
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
    <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 font-heading">
            Bank <span className="text-indigo-600">Reconciliation</span> Records
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Centralized hub for all imported statement transactions and historical audit data.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-100/50 p-2 rounded-2xl w-fit mb-10 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'upload' ? 'bg-white text-emerald-600 shadow-premium' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
          }`}
        >
          <UploadCloud className="h-4 w-4" /> Import Statement
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'search' ? 'bg-white text-blue-600 shadow-premium' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
          }`}
        >
          <Search className="h-4 w-4" /> Explorer Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-3">
          {activeTab === 'upload' && (
            <div className="animate-fade-in-up">
              <UploadStatement />
            </div>
          )}
          {activeTab === 'search' && (
            <div className="glass-card rounded-[2.5rem] shadow-premium border-0 p-10 animate-fade-in-up relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                Advanced Transaction Explorer
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">General keywords (Ref No, Details)</label>
                  <input 
                    type="text" 
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by any transaction detail..." 
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                  <input 
                    type="text" 
                    name="accountNo"
                    value={filters.accountNo}
                    onChange={handleFilterChange}
                    placeholder="Filter by account..." 
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range (From)</label>
                  <input 
                    type="date" 
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range (To)</label>
                  <input 
                    type="date" 
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div className="flex items-end gap-3 xl:col-span-1">
                  <button 
                    onClick={() => fetchTransactions(1)}
                    className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Filter
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="glass-card rounded-[2.5rem] shadow-premium border-0 p-8 h-fit relative overflow-hidden group">
           <div className="absolute -left-4 -bottom-4 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
           <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
               <DownloadCloud className="h-4 w-4 text-indigo-600" />
             </div>
             Quick Stats
           </h3>
           <div className="space-y-4 relative z-10">
             <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl group-hover:bg-white transition-colors duration-500">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Found</p>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{pagination.total.toLocaleString()}</div>
                <p className="text-[10px] font-bold text-indigo-500 uppercase mt-2">Verified Transactions</p>
             </div>
             
             <div className="p-2">
               <p className="text-xs text-slate-400 font-medium leading-relaxed">
                 Records are extracted from uploaded statement files. The ledger is automatically updated upon import.
               </p>
             </div>
           </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border-0 overflow-hidden animate-fade-in-up">
        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-transparent flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight font-heading flex items-center gap-3">
              Statement Audit Ledger
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {filters.accountNo ? `Account: ${filters.accountNo}` : 'All Unified Bank Records'}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-8 py-5 font-black">Post Date</th>
                <th className="px-8 py-5 font-black">Value Date</th>
                <th className="px-8 py-5 font-black">Reference No</th>
                <th className="px-8 py-5 font-black">Description</th>
                <th className="px-8 py-5 font-black text-right">Debit</th>
                <th className="px-8 py-5 font-black text-right">Credit</th>
                <th className="px-8 py-5 font-black text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Ledger Data...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="h-8 w-8 text-slate-200" />
                      <p className="text-slate-900 font-black tracking-tight">No Transactions Found</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Adjust filters or upload a new statement</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                  <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-500">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-indigo-600 font-black">
                    {tx.valueDate ? new Date(tx.valueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-8 py-5 font-mono font-black text-slate-400 group-hover:text-slate-900 transition-colors">{tx.refNo}</td>
                  <td className="px-8 py-5 max-w-[200px] truncate font-bold text-slate-500">{tx.description}</td>
                  <td className="px-8 py-5 text-right font-bold text-rose-600">
                    {tx.debit ? tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-emerald-600">
                    {tx.credit ? tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 tracking-tighter text-sm">
                    {tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
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
      </div>
    </div>
  );
}

