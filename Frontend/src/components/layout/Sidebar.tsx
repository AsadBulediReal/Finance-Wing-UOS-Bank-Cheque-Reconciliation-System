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
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Finance Wing UOS</h2>
        <p className="text-sm text-slate-400 mt-1">Reconciliation System</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2026 UOS Finance Wing
      </div>
    </aside>
  );
}
