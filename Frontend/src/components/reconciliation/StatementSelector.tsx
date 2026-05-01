import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Pagination from '../ui/Pagination';

interface StatementSelectorProps {
  onTransactionsLoad: (txs: any[]) => void;
  refreshKey?: number;
}

export default function StatementSelector({ onTransactionsLoad, refreshKey }: StatementSelectorProps) {
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
    api.getAllTransactions({ ...cleanFilters, page, limit }).then(res => {
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
    fetchTransactions(1);
  }, [refreshKey]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    const reset = {
      dateFrom: '', dateTo: '', valueDateFrom: '', valueDateTo: '', refNo: '', accountNo: '',
      description: '', debit: '', credit: '', amount: '', balance: ''
    };
    setFilters(reset);
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-amber-500 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-md font-semibold text-slate-800">B. Find Bank Record (BR)</h3>
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-r-transparent"></div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Section: Search bank records */}
        <div className="text-sm mb-6 shrink-0">
          <label className="block font-semibold text-slate-700 mb-3 uppercase tracking-wide text-xs">Search & Filter Records</label>
          <div className="grid grid-cols-2 gap-3">
            {/* ... form fields remain same ... */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Ref No</label>
              <input
                type="text"
                name="refNo"
                value={filters.refNo}
                onChange={handleFilterChange}
                placeholder="Ref No"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Account No</label>
              <input
                type="text"
                name="accountNo"
                value={filters.accountNo}
                onChange={handleFilterChange}
                placeholder="Account"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Search Amount (Checks both Debit/Credit)</label>
              <input
                type="number"
                name="amount"
                value={filters.amount}
                onChange={handleFilterChange}
                placeholder="Enter amount to search in BS..."
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold bg-amber-50 text-amber-900 placeholder:text-amber-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
                placeholder="Full description"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Debit</label>
              <input
                type="number"
                name="debit"
                value={filters.debit}
                onChange={handleFilterChange}
                placeholder="Debit"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Credit</label>
              <input
                type="number"
                name="credit"
                value={filters.credit}
                onChange={handleFilterChange}
                placeholder="Credit"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Value Date From</label>
              <input
                type="date"
                name="valueDateFrom"
                value={filters.valueDateFrom}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Value Date To</label>
              <input
                type="date"
                name="valueDateTo"
                value={filters.valueDateTo}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => fetchTransactions(1)}
              className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 transition-colors"
            >
              Search Records
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-md font-medium hover:bg-slate-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Preview table */}
        <div className="pt-4 border-t border-slate-200 flex-1 flex flex-col overflow-hidden min-h-[300px]">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <label className="block font-semibold text-slate-700 text-sm uppercase tracking-wider">Unreconciled Records ({pagination.total})</label>
          </div>
          <div className="border border-slate-200 rounded-md overflow-hidden flex-1 flex flex-col">
            <div className="overflow-y-auto min-h-[250px] flex-1">
              <table className="w-full text-left text-xs relative">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 font-medium">Tx Date</th>
                    <th className="px-3 py-2 font-medium">Value Date</th>
                    <th className="px-3 py-2 font-medium">Ref No</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium text-right">Debit</th>
                    <th className="px-3 py-2 font-medium text-right">Credit</th>
                    <th className="px-3 py-2 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500 italic">
                        <div className="flex flex-col items-center gap-2">
                          <span>No records loaded.</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Search above to load records for reconciliation</span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{tx.valueDate ? new Date(tx.valueDate).toLocaleDateString() : '-'}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{tx.refNo}</td>
                      <td className="px-3 py-2 truncate max-w-[120px]" title={tx.description}>{tx.description}</td>
                      <td className="px-3 py-2 text-right">{tx.debit ? tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-3 py-2 text-right">{tx.credit ? tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                      <td className="px-3 py-2 text-right font-medium">{tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI for Selector */}
            {transactions.length > 0 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
