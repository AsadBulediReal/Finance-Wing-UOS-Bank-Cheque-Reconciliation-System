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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Cashed */}
      <div className="glass-card rounded-[2rem] p-8 shadow-premium border-0 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="absolute -right-6 -top-6 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-emerald-600/50 uppercase tracking-[0.2em]">Verified</span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Matched Cheques</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{summary.cashed.count}</h3>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">
              {summary.cashed.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Unchased */}
      <div className="glass-card rounded-[2rem] p-8 shadow-premium border-0 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="absolute -right-6 -top-6 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-amber-600/50 uppercase tracking-[0.2em]">Pending</span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Unchased Records</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{summary.unchased.count}</h3>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">
              {summary.unchased.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Unreconciled */}
      <div className="glass-card rounded-[2rem] p-8 shadow-premium border-0 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="absolute -right-6 -top-6 h-32 w-32 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <HelpCircle className="h-6 w-6 text-rose-600" />
            </div>
            <span className="text-[10px] font-black text-rose-600/50 uppercase tracking-[0.2em]">Review</span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Manual Review</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{summary.unreconciled.count}</h3>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">
              {summary.unreconciled.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Total Cheques */}
      <div className="glass-card rounded-[2rem] p-8 shadow-premium border-0 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Summary</span>
          </div>
          <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest mb-1">Total System Entries</p>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-4">{summary.total.count}</h3>
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm font-black text-white tracking-tight uppercase">
              Operational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
