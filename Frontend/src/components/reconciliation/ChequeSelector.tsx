import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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
    api.getCheques({ ...cleanFilters, status: 'UNRECONCILED', page, limit })
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-green-500 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-md font-semibold text-slate-800">A. Select Cheque or List</h3>
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-r-transparent"></div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">Cheque No</label>
            <input 
              type="text" 
              name="chequeNo"
              value={filters.chequeNo}
              onChange={handleFilterChange}
              placeholder="Cheque No" 
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">Amount</label>
            <input 
              type="number" 
              name="amount"
              value={filters.amount}
              onChange={handleFilterChange}
              placeholder="Amount" 
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Description</label>
            <input 
              type="text" 
              name="description"
              value={filters.description}
              onChange={handleFilterChange}
              placeholder="Description" 
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input 
              type="date" 
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input 
              type="date" 
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <button 
            onClick={() => fetchCheques(1)}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors mt-2"
          >
            <Search className="h-4 w-4" /> Search Cheques
          </button>
        </div>
        
        <div className="flex-1 border border-slate-200 rounded-md overflow-hidden flex flex-col min-h-[200px]">
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium">Select</th>
                  <th className="px-3 py-2 font-medium">Cheque No</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unreconciledCheques.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4 text-slate-500">No unreconciled cheques.</td></tr>
                ) : unreconciledCheques.map(cheque => (
                  <tr 
                    key={cheque._id} 
                    className={`hover:bg-slate-50 cursor-pointer ${selectedId === cheque._id ? 'bg-indigo-50' : ''}`}
                    onClick={() => onSelect(cheque)}
                  >
                    <td className="px-3 py-2">
                      <input 
                        type="radio" 
                        name="selectedCheque" 
                        className="accent-green-600" 
                        checked={selectedId === cheque._id}
                        onChange={() => onSelect(cheque)}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-600">{cheque.chequeNo}</td>
                    <td className="px-3 py-2 font-medium text-right">{cheque.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination for Selector */}
          <div className="border-t border-slate-200 bg-slate-50">
            <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.limit}
              onPageSizeChange={handlePageSizeChange}
              className="py-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
