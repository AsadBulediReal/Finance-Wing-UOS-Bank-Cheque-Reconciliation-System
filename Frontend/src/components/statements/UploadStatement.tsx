import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../../lib/api';
import { ConfirmAction } from '../ui/ConfirmAction';

export default function UploadStatement() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, description: string, variant?: "default" | "destructive" } | null>(null);

  const showAlert = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setAlertConfig({ isOpen: true, title, description, variant });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showAlert('Required', 'Please select a file first.', 'destructive');
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadStatement(file, { uploadedBy: 'Current User' });
      showAlert('Success', 'Bank statement uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      showAlert('Error', `Error: ${error.response?.data?.message || error.message}`, 'destructive');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] shadow-premium border-0 p-10 animate-fade-in-up relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Upload className="h-5 w-5 text-emerald-600" />
        </div>
        Bulk Statement Integration
      </h3>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed ${file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50'} rounded-[2rem] p-16 text-center cursor-pointer hover:bg-slate-100/50 transition-all group/drop mb-10`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept=".csv,.xlsx"
        />
        <div className={`h-20 w-20 rounded-3xl ${file ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-slate-100 text-slate-400 group-hover/drop:bg-white group-hover/drop:text-emerald-500'} mx-auto mb-6 flex items-center justify-center transition-all duration-500`}>
          <Upload className="h-10 w-10" />
        </div>
        <p className="text-lg font-black text-slate-800 tracking-tight">{file ? file.name : 'Select bank export file'}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">The AI engine will automatically parse and map all fields</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2rem] relative">
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Required Data Structure:</h4>
          <div className="space-y-3 text-[11px] font-bold text-slate-500">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              <p><span className="text-emerald-700">Account Mapping:</span> Detected on row 2</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              <p><span className="text-emerald-700">Header Index:</span> Expected on row 11</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
              <p><span className="text-emerald-700">Payload:</span> Transactions starting row 12</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:pt-4">
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${!file || isUploading ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1'}`}
          >
            {isUploading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'SYNCHRONIZING...' : 'START IMPORT ENGINE'}
          </button>
          <button 
            onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
          >
            Clear Selection
          </button>
        </div>
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
