import { useState } from 'react';
import { api } from '../../lib/api';
import { ConfirmAction } from '../ui/ConfirmAction';

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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-t-4 border-t-green-500">
      <h3 className="text-lg font-medium text-slate-800 mb-4">Add New Entry</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
          <input 
            type="date" 
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cheque No</label>
          <input 
            type="text" 
            name="chequeNo"
            placeholder="Enter Cheque No" 
            value={formData.chequeNo}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input 
            type="text" 
            name="description"
            placeholder="Enter Description" 
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <input 
            type="number" 
            name="amount"
            placeholder="Enter Amount" 
            value={formData.amount}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Save
        </button>
        <button 
          onClick={() => setFormData({ issueDate: '', chequeNo: '', description: '', amount: '' })}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
        >
          Clear
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
