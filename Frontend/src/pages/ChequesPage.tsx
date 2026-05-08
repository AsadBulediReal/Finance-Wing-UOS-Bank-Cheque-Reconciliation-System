import { useState, useRef } from 'react';
import AddChequeForm from '../components/cheques/AddChequeForm';
import ChequeTable from '../components/cheques/ChequeTable';
import { PlusCircle, Search, Upload } from 'lucide-react';
import { api } from '../lib/api';

export default function ChequesPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'search' | 'upload'>('add');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      await api.uploadCheques(file);
      alert('Cheque list uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 font-heading">
            Cheque <span className="text-emerald-600">Records</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Complete inventory management of issued cheques and their statuses.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-100/50 p-2 rounded-2xl w-fit mb-10 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'add' ? 'bg-white text-emerald-600 shadow-premium' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
          }`}
        >
          <PlusCircle className="h-4 w-4" /> Add Entry
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'search' ? 'bg-white text-amber-600 shadow-premium' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
          }`}
        >
          <Search className="h-4 w-4" /> Filter Search
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'upload' ? 'bg-white text-indigo-600 shadow-premium' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
          }`}
        >
          <Upload className="h-4 w-4" /> Batch Upload
        </button>
      </div>

      <div className="mb-12">
        {activeTab === 'add' && (
          <div className="animate-fade-in-up">
            <AddChequeForm />
          </div>
        )}
        
        {activeTab === 'search' && (
          <div className="glass-card rounded-[2.5rem] shadow-premium border-0 p-10 animate-fade-in-up relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-amber-600" />
              </div>
              Advanced Filter Search
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label>
                <input type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cheque Number</label>
                <input type="text" placeholder="Ex: 000123" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <input type="text" placeholder="Search by recipient or details..." className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                <input type="number" placeholder="0.00" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button className="px-8 py-4 bg-amber-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-100 hover:bg-amber-700 hover:-translate-y-1 transition-all active:scale-95">
                Apply Filters
              </button>
              <button className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="glass-card rounded-[2.5rem] shadow-premium border-0 p-10 animate-fade-in-up relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-indigo-600" />
              </div>
              Batch Data Upload
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50'} rounded-[2rem] p-16 text-center cursor-pointer hover:bg-slate-100/50 transition-all group/drop`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept=".csv,.xlsx"
              />
              <div className={`h-20 w-20 rounded-3xl ${file ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400 group-hover/drop:bg-white group-hover/drop:text-indigo-500'} mx-auto mb-6 flex items-center justify-center transition-all duration-500`}>
                <Upload className="h-10 w-10" />
              </div>
              <p className="text-lg font-black text-slate-800 tracking-tight">{file ? file.name : 'Select data source file'}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">CSV or Excel (XLSX) files supported</p>
            </div>
            
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-3xl relative">
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Schema Requirements:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Issue Date', 'Cheque No', 'Description', 'Amount'].map(field => (
                    <span key={field} className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider">{field}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 lg:justify-end">
                <button 
                  onClick={handleUpload}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Confirm & Upload
                </button>
                <button 
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChequeTable />
    </div>
  );
}

