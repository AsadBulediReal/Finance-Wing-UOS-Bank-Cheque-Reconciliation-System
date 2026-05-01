import { useState, useEffect } from 'react';
import UploadStatement from '../components/statements/UploadStatement';
import DownloadStatement from '../components/statements/DownloadStatement';
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
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bank Records</h1>
        <p className="text-slate-500 mt-2">Manage all bank transaction records in one place. Records are added directly to the database on upload.</p>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <UploadCloud className="h-4 w-4 text-emerald-600" /> Upload Records
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Search className="h-4 w-4 text-blue-600" /> Search & Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {activeTab === 'upload' && <UploadStatement />}
          {activeTab === 'search' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-t-4 border-t-blue-500">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Search & Filter Transactions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">General Search (Ref No, Description)</label>
                  <input 
                    type="text" 
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Enter keywords..." 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                  <input 
                    type="text" 
                    name="accountNo"
                    value={filters.accountNo}
                    onChange={handleFilterChange}
                    placeholder="Filter by account..." 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date From</label>
                  <input 
                    type="date" 
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date To</label>
                  <input 
                    type="date" 
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Value Date From</label>
                  <input 
                    type="date" 
                    name="valueDateFrom"
                    value={filters.valueDateFrom}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Value Date To</label>
                  <input 
                    type="date" 
                    name="valueDateTo"
                    value={filters.valueDateTo}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button 
                    onClick={() => fetchTransactions(1)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" /> Filter
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 p-6 h-fit">
           <h3 className="text-lg font-medium text-slate-800 mb-4">Record Management</h3>
           <p className="text-sm text-slate-600 mb-4">
             The system stores bank transactions as individual, independent records. Metadata is extracted directly from every upload.
           </p>
           <div className="space-y-3">
             <div className="bg-white p-3 rounded border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Records Match Search</div>
                <div className="text-2xl font-bold text-slate-800">{pagination.total.toLocaleString()}</div>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Bank Transaction Records</h3>
          <div className="text-sm text-slate-500">
            {filters.accountNo ? `Filtered by Account: ${filters.accountNo}` : 'All bank records'}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="px-6 py-3 font-medium">Transaction Date</th>
                <th className="px-6 py-3 font-medium">Value Date</th>
                <th className="px-6 py-3 font-medium">Transaction Reference No</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Debit</th>
                <th className="px-6 py-3 font-medium text-right">Credit</th>
                <th className="px-6 py-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-emerald-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <span className="ml-3 text-slate-500">Loading records...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 italic">No transactions found.</td>
                </tr>
              ) : transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.valueDate ? new Date(tx.valueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{tx.refNo}</td>
                  <td className="px-6 py-4">{tx.description}</td>
                  <td className="px-6 py-4 text-right">{tx.debit ? tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                  <td className="px-6 py-4 text-right">{tx.credit ? tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                  <td className="px-6 py-4 text-right font-medium">{tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-slate-200 bg-slate-50 px-4">
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

