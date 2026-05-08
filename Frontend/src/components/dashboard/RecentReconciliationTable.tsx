import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import ReconciliationDetailsModal from './ReconciliationDetailsModal';
import Pagination from '../ui/Pagination';
import { Loader2, Search, Filter, ChevronDown, ChevronUp, RotateCcw, FileSpreadsheet } from 'lucide-react';

export default function RecentReconciliationTable() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    transDateFrom: '',
    transDateTo: '',
    matchType: '',
    chequeNo: '',
    amount: '',
    description: ''
  });

  const fetchCheques = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getCheques({ 
        page, 
        limit, 
        sortBy: 'issueDate', 
        sortOrder: 'desc',
        ...filters
      });
      setCheques(res.data);
      setTotalEntries(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error fetching recent cheques:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchCheques();
  }, [fetchCheques]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      transDateFrom: '',
      transDateTo: '',
      matchType: '',
      chequeNo: '',
      amount: '',
      description: ''
    });
    setPage(1);
  };

  const handleExport = () => {
    api.exportCheques(filters);
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
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight font-heading flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 text-white" />
            </div>
            Recent Reconciliation Activities
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit log of system matches</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search across all records..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          
          <button 
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-sm font-bold ${isFilterExpanded ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline uppercase tracking-tighter text-xs">Filters</span>
            {isFilterExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="p-3 bg-emerald-600 text-white border-0 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
              title="Download Excel Report"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>

            <button 
              onClick={resetFilters}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm active:scale-95"
              title="Reset All Filters"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isFilterExpanded && (
        <div className="px-8 py-8 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in-up">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="CASHED">Cashed</option>
              <option value="UNCASHED">Unchased</option>
              <option value="UNRECONCILED">Unreconciled</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cheque No</label>
            <input 
              type="text" 
              placeholder="Ex: 123456"
              value={filters.chequeNo}
              onChange={(e) => handleFilterChange('chequeNo', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Amount</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={filters.amount}
              onChange={(e) => handleFilterChange('amount', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2 lg:col-span-2 xl:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description Keywords</label>
            <input 
              type="text" 
              placeholder="Search description details..."
              value={filters.description}
              onChange={(e) => handleFilterChange('description', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date From</label>
            <input 
              type="date" 
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date To</label>
            <input 
              type="date" 
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Match Type</label>
            <select 
              value={filters.matchType}
              onChange={(e) => handleFilterChange('matchType', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            >
              <option value="">All Methods</option>
              <option value="AUTO">Automatic Match</option>
              <option value="MANUAL">Manual Review</option>
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
              <th className="px-8 py-5 font-black">Issue Date</th>
              <th className="px-8 py-5 font-black">Matched Date</th>
              <th className="px-8 py-5 font-black">Cheque No</th>
              <th className="px-8 py-5 font-black">Description</th>
              <th className="px-8 py-5 font-black text-right">Amount</th>
              <th className="px-8 py-5 font-black text-center">Engine</th>
              <th className="px-8 py-5 font-black text-center">Status</th>
              <th className="px-8 py-5 font-black text-right">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Audit Data...</p>
                  </div>
                </td>
              </tr>
            ) : cheques.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                      <Search className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight">No Reconciliation Data Found</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Try adjusting your search parameters</p>
                  </div>
                </td>
              </tr>
            ) : (
              cheques.map((cheque) => (
                <tr key={cheque._id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                  <td className="px-8 py-5 whitespace-nowrap font-bold text-slate-500">{new Date(cheque.issueDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-indigo-600 font-black">
                    {cheque.bsDate ? new Date(cheque.bsDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-8 py-5 font-mono font-black text-slate-400 group-hover:text-slate-900 transition-colors">{cheque.chequeNo}</td>
                  <td className="px-8 py-5 max-w-[250px] truncate font-bold text-slate-500">{cheque.description}</td>
                  <td className="px-8 py-5 font-black text-right text-slate-900 tracking-tighter text-sm">
                    {cheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {cheque.matchType ? (
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border shadow-sm ${cheque.matchType === 'AUTO' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                        {cheque.matchType === 'AUTO' ? 'Auto-Engine' : 'Manual-Match'}
                      </span>
                    ) : (
                      <span className="text-slate-200 font-black">-</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">{getStatusBadge(cheque.status)}</td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedChequeId(cheque._id)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalEntries={totalEntries}
          pageSize={limit}
          onPageSizeChange={(size) => {
            setLimit(size);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {selectedChequeId && (
        <ReconciliationDetailsModal 
          chequeId={selectedChequeId} 
          onClose={() => setSelectedChequeId(null)} 
          onRefresh={fetchCheques}
        />
      )}
    </div>
  );
}
