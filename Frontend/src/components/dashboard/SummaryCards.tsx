import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, FileText } from 'lucide-react';
import { api } from '../../lib/api';

export default function SummaryCards() {
  const [summary, setSummary] = useState({
    cashed: { count: 0, amount: 0 },
    unchased: { count: 0, amount: 0 },
    unreconciled: { count: 0, amount: 0 },
    total: { count: 0 }
  });

  useEffect(() => {
    api.getDashboardSummary().then(data => {
      setSummary({
        cashed: data.summary.CASHED || { count: 0, amount: 0 },
        unchased: data.summary.UNCASHED || { count: 0, amount: 0 },
        unreconciled: data.summary.UNRECONCILED || { count: 0, amount: 0 },
        total: data.total || { count: 0 }
      });
    }).catch(err => console.error('Error fetching dashboard summary:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Cashed */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-l-4 border-l-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Cashed</p>
            <h3 className="text-3xl font-bold text-slate-800">{summary.cashed.count}</h3>
            <p className="text-sm text-slate-500 mt-2">Total Amount: <span className="font-semibold text-slate-700">{summary.cashed.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
          </div>
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Unchased */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-l-4 border-l-yellow-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Unchased</p>
            <h3 className="text-3xl font-bold text-slate-800">{summary.unchased.count}</h3>
            <p className="text-sm text-slate-500 mt-2">Total Amount: <span className="font-semibold text-slate-700">{summary.unchased.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
          </div>
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Unreconciled */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-l-4 border-l-red-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Unreconciled</p>
            <h3 className="text-3xl font-bold text-slate-800">{summary.unreconciled.count}</h3>
            <p className="text-sm text-slate-500 mt-2">Total Amount: <span className="font-semibold text-slate-700">{summary.unreconciled.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
          </div>
          <div className="bg-red-100 p-2 rounded-full">
            <HelpCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Total Cheques */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Cheques</p>
            <h3 className="text-3xl font-bold text-slate-800">{summary.total.count}</h3>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
