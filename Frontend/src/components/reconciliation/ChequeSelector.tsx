import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import Pagination from '../ui/Pagination';

interface ChequeSelectorProps {
  onSelect: (cheque: any) => void;
  selectedId?: string;
  refreshKey?: number;
}

export default function ChequeSelector({ onSelect, selectedId, refreshKey }: ChequeSelectorProps) {
  const [unreconciledCheques, setUnreconciledCheques] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    chequeNo: '',
    description: '',
    amount: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5 // Smaller default limit
  });

  const fetchCheques = (page = 1, limit = pagination.limit) => {
    setIsLoading(true);
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    const hasFilters = Object.keys(cleanFilters).length > 0;
    const params: any = { ...cleanFilters, page, limit };
    if (!hasFilters) {
      setUnreconciledCheques([]);
      setPagination(prev => ({ ...prev, page: 1, totalPages: 1, total: 0 }));
      setIsLoading(false);
      return;
    }
    
    api.getCheques(params)
      .then(res => {
        setUnreconciledCheques(res.data);
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
  }, [refreshKey]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCheques(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchCheques(1, newSize);
  };

  const handleReset = () => {
    setFilters({
      chequeNo: '',
      description: '',
      amount: '',
      dateFrom: '',
      dateTo: ''
    });
    // Use a small timeout to ensure state is updated before fetching
    setTimeout(() => fetchCheques(1), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCheques(1);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-full min-h-[650px] shadow-premium transition-all duration-500 hover:shadow-2xl border-t-0">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-heading">Cheque Selector</h3>
        </div>
        {isLoading && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8 shrink-0">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cheque No</label>
            <input 
              type="text" 
              name="chequeNo"
              value={filters.chequeNo}
              onChange={handleFilterChange}
              placeholder="Ex: 123456" 
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
            <input 
              type="number" 
              name="amount"
              value={filters.amount}
              onChange={handleFilterChange}
              placeholder="0.00" 
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
            <input 
              type="text" 
              name="description"
              value={filters.description}
              onChange={handleFilterChange}
              placeholder="Search by payee or details..." 
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">From Date</label>
            <input 
              type="date" 
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">To Date</label>
            <input 
              type="date" 
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white" 
            />
          </div>
          <div className="col-span-2 flex gap-3 mt-2">
            <button 
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Search className="h-4 w-4" /> Search Cheques
            </button>
            <button 
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Reset
            </button>
          </div>
        </form>
        
        <div className="flex flex-col mb-3 shrink-0 px-1 gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Search Results ({pagination.total})</label>
          </div>
          {unreconciledCheques.some(c => c.status === 'CASHED') && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-3 font-semibold animate-pulse shadow-sm">
              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <span>THE SEARCHED RECORD IS ALREADY CASHED</span>
            </div>
          )}
        </div>
        <div className="flex-1 border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-white/50 min-h-[250px]">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm relative">
              <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Select</th>
                  <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Cheque No</th>
                  <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {unreconciledCheques.filter(c => c.status !== 'CASHED').length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{unreconciledCheques.some(c => c.status === 'CASHED') ? "No Unreconciled Records" : "No Cheques Found"}</p>
                        <p className="text-[10px] mt-1 text-slate-400 uppercase font-bold tracking-widest">Try adjusting filters or checking other statuses.</p>
                      </div>
                    </div>
                  </td></tr>
                ) : unreconciledCheques.filter(c => c.status !== 'CASHED').map(cheque => (
                  <tr 
                    key={cheque._id} 
                    className={`group hover:bg-emerald-50/50 cursor-pointer transition-colors duration-200 ${selectedId === cheque._id ? 'bg-emerald-50' : ''}`}
                    onClick={() => onSelect(cheque)}
                  >
                    <td className="px-4 py-4">
                      <div className="relative flex items-center justify-center h-5 w-5">
                        <input 
                          type="radio" 
                          name="selectedCheque" 
                          className="h-4 w-4 accent-emerald-600 transition-all scale-110" 
                          checked={selectedId === cheque._id}
                          onChange={() => onSelect(cheque)}
                          disabled={cheque.status === 'CASHED'}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono font-semibold text-slate-700">{cheque.chequeNo}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                        cheque.status === 'CASHED' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : cheque.status === 'UNRECONCILED' 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cheque.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900 text-right">
                      {cheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {unreconciledCheques.filter(c => c.status !== 'CASHED').length > 0 && (
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
  );
}
