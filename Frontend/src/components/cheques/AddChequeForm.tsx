import { useState } from 'react';
import { api } from '../../lib/api';
import { ConfirmAction } from '../ui/ConfirmAction';
import { PlusCircle } from 'lucide-react';

export default function AddChequeForm() {
  const [formData, setFormData] = useState({
    issueDate: '',
    chequeNo: '',
    description: '',
    amount: ''
  });
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive" } | null>(null);

  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertConfig({ isOpen: true, title, description, variant });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.issueDate || !formData.chequeNo || !formData.amount) {
      showAlert('Required', 'Please fill in all required fields.', 'destructive');
      return;
    }

    try {
      await api.addCheque({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      showAlert('Success', 'Cheque added successfully!');
      setFormData({ issueDate: '', chequeNo: '', description: '', amount: '' });
    } catch (error: any) {
      showAlert('Error', `Error: ${error.response?.data?.message || error.message}`, 'destructive');
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] shadow-premium border-0 p-10 animate-fade-in-up relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <PlusCircle className="h-5 w-5 text-emerald-600" />
        </div>
        Direct Entry Registration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date <span className="text-rose-500">*</span></label>
          <input 
            type="date" 
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cheque Number <span className="text-rose-500">*</span></label>
          <input 
            type="text" 
            name="chequeNo"
            placeholder="Ex: 000123" 
            value={formData.chequeNo}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient / Description</label>
          <input 
            type="text" 
            name="description"
            placeholder="Enter purpose or beneficiary details..." 
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
          />
        </div>
        <div className="space-y-2 lg:col-span-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount <span className="text-rose-500">*</span></label>
          <input 
            type="number" 
            name="amount"
            placeholder="0.00" 
            value={formData.amount}
            onChange={handleChange}
            className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-5 py-3.5 text-sm font-black text-emerald-900 placeholder:text-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
          />
        </div>
      </div>
      <div className="mt-10 flex gap-4">
        <button 
          onClick={handleSave}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95"
        >
          Register Cheque
        </button>
        <button 
          onClick={() => setFormData({ issueDate: '', chequeNo: '', description: '', amount: '' })}
          className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
        >
          Reset Form
        </button>
      </div>
      <ConfirmAction
        isOpen={!!alertConfig?.isOpen}
        onClose={() => setAlertConfig(null)}
        onConfirm={() => setAlertConfig(null)}
        title={alertConfig?.title || 'Notification'}
        description={alertConfig?.description || ''}
        confirmText="OK"
        showCancel={false}
        variant={alertConfig?.variant}
      />
    </div>
  );
}
