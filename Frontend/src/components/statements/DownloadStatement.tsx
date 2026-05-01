import { Download } from 'lucide-react';

export default function DownloadStatement() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-t-4 border-t-amber-500">
      <h3 className="text-lg font-medium text-slate-800 mb-4">Download Bank Statement</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date From</label>
          <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date To</label>
          <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
        <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option>CSV (.csv)</option>
          <option>Excel (.xlsx)</option>
        </select>
      </div>

      <button className="w-full px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
        <Download className="h-4 w-4" /> Download
      </button>
    </div>
  );
}
