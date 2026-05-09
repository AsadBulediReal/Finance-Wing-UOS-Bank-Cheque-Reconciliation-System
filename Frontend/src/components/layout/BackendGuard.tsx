import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Loader2, ServerCrash, ShieldCheck } from 'lucide-react';

export default function BackendGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(() => {
    return sessionStorage.getItem('backend_initialized') === 'true' ? 'ready' : 'loading';
  });
  const [message, setMessage] = useState('Initializing secure connection...');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (status === 'ready') return;

    const checkConnection = async () => {
      try {
        setStatus('loading');
        setMessage('Verifying backend systems...');
        await api.checkHealth();
        
        // Mark as initialized for this session
        sessionStorage.setItem('backend_initialized', 'true');
        
        // Add a small artificial delay for a smoother "premium" transition
        setTimeout(() => {
          setStatus('ready');
        }, 800);
      } catch (error) {
        console.error('Backend health check failed:', error);
        setStatus('error');
        setMessage('Unable to establish connection with the banking server.');
      }
    };

    checkConnection();
  }, [retryCount]);

  if (status === 'ready') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
         <div className="absolute -left-1/4 -top-1/4 h-[70%] w-[70%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute -right-1/4 -bottom-1/4 h-[70%] w-[70%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full glass-card rounded-[3rem] p-12 text-center relative z-10 shadow-2xl animate-scale-in">
        <div className="mb-8 relative inline-block">
          <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${
            status === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
          }`}>
            {status === 'loading' ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : status === 'error' ? (
              <ServerCrash className="h-10 w-10" />
            ) : (
              <ShieldCheck className="h-10 w-10" />
            )}
          </div>
          {status === 'loading' && (
            <div className="absolute -inset-4 border-2 border-dashed border-indigo-200 rounded-[2.5rem] animate-spin-slow"></div>
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
          {status === 'loading' ? 'System Initialization' : 'Connection Error'}
        </h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          {message}
        </p>

        {status === 'error' ? (
          <button 
            onClick={() => setRetryCount(prev => prev + 1)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Retry Connection
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce"></div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
