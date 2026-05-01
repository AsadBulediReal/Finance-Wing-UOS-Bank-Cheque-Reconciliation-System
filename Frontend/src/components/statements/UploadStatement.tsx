import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../../lib/api';

export default function UploadStatement() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsUploading(true);
    try {
      // We pass an empty object or just the necessary fields if needed.
      // The backend now extracts name, dates, account info, etc. automatically.
      await api.uploadStatement(file, { uploadedBy: 'Current User' });
      alert('Bank statement uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 border-t-4 border-t-emerald-500">
      <h3 className="text-lg font-medium text-slate-800 mb-4">Upload Bank Statement File</h3>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'} rounded-lg p-10 text-center cursor-pointer hover:bg-slate-100 transition-colors mb-6`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept=".csv,.xlsx"
        />
        <Upload className={`h-12 w-12 ${file ? 'text-emerald-500' : 'text-slate-400'} mx-auto mb-4`} />
        <p className="text-base font-medium text-slate-700">{file ? file.name : 'Choose Bank Statement File'}</p>
        <p className="text-sm text-slate-500 mt-2">The system will automatically extract all records and metadata.</p>
        <p className="text-xs text-slate-400 mt-1">(Allowed formats: .csv, .xlsx)</p>
      </div>
      
      <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-emerald-50 px-4 py-2 border-b border-slate-200">
          <h4 className="text-sm font-semibold text-emerald-800 text-center uppercase tracking-wider">Required File Structure</h4>
        </div>
        <div className="p-4 bg-slate-50 text-xs text-slate-600 leading-relaxed">
          <p className="mb-2"><span className="font-bold text-emerald-700">Rows 1-10:</span> Metadata (Account Number on Row 2, Branch on Row 6)</p>
          <p className="mb-2"><span className="font-bold text-emerald-700">Row 11:</span> Headers (Transaction Date, Value Date, Transaction Reference No, Description, Debit, Credit, Balance)</p>
          <p><span className="font-bold text-emerald-700">Row 12+:</span> Transaction Records</p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-6 py-2.5 ${!file || isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2`}
        >
          {isUploading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="h-4 w-4" /> Start Import
            </>
          )}
        </button>
        <button 
          onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
