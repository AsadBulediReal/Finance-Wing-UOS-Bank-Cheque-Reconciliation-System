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
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cheque Management</h1>
        <p className="text-slate-500 mt-2">Add, search, and manage cheque entries.</p>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'add' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <PlusCircle className="h-4 w-4 text-green-600" /> Add New Entry
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Search className="h-4 w-4 text-yellow-600" /> Search Cheque
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Upload className="h-4 w-4 text-purple-600" /> Upload Cheque List
        </button>
      </div>

      <div className="mb-8">
        {activeTab === 'add' && <AddChequeForm />}
        
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-t-4 border-t-yellow-500">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Search Cheque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cheque No</label>
                <input type="text" placeholder="Enter Cheque No" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" placeholder="Enter Description" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input type="number" placeholder="Enter Amount" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors">
                Search
              </button>
              <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors">
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-t-4 border-t-purple-500">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Upload Cheque List</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${file ? 'border-purple-500 bg-purple-50' : 'border-slate-300 bg-slate-50'} rounded-lg p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept=".csv,.xlsx"
              />
              <Upload className={`h-10 w-10 ${file ? 'text-purple-500' : 'text-slate-400'} mx-auto mb-3`} />
              <p className="text-sm font-medium text-slate-700">{file ? file.name : 'Choose File or drag and drop'}</p>
              <p className="text-xs text-slate-500 mt-1">(Allowed formats: .csv, .xlsx)</p>
            </div>
            <div className="mt-4 bg-purple-50 text-purple-800 p-4 rounded-md text-sm">
              <h4 className="font-semibold mb-2">FILE SHOULD CONTAIN COLUMNS:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Issue Date</li>
                <li>Cheque No</li>
                <li>Description</li>
                <li>Amount</li>
              </ul>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleUpload}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" /> Upload
              </button>
              <button 
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <ChequeTable />
    </div>
  );
}

