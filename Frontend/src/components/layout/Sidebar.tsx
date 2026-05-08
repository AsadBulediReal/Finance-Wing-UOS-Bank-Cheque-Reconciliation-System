import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, UploadCloud, CheckSquare } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cheques', path: '/cheques', icon: FileText },
    { name: 'Bank Records', path: '/statements', icon: UploadCloud },
    { name: 'Reconciliation', path: '/reconciliation', icon: CheckSquare },
  ];

  return (
    <aside className="w-72 bg-slate-950 text-slate-100 h-screen sticky top-0 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.1)] z-20 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 h-64 w-64 bg-indigo-600 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 h-40 w-40 bg-emerald-600 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="p-10 relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20 group">
          <CheckSquare className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter text-white font-heading">
          UOS <span className="text-indigo-500">Finance</span>
        </h2>
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mt-2">
          Reconciliation Engine
        </p>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-4 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black group relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              <Icon className={`h-5 w-5 transition-transform duration-500 group-hover:scale-110`} />
              <span className="uppercase tracking-widest text-[11px] font-black">{item.name}</span>
              {/* Active Indicator */}
              <div className="absolute left-0 w-1 h-0 bg-white rounded-full transition-all duration-500 group-[.active]:h-6 -ml-0.5"></div>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-8 border-t border-white/5 relative z-10">
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Administrator</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">UOS Main Wing</p>
          </div>
        </div>
        <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em] text-center mt-6">
          &copy; 2026 Systems V2.4
        </p>
      </div>
    </aside>
  );
}
