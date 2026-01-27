import { useState, useEffect } from 'react';
import { Lock, Unlock, FolderOpen, Loader2, X, Check, ChevronRight, GripVertical } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import safeIcon from '@/assets/icon.png';

type ViewState = 'path' | 'password' | 'manager';
type SafeStatus = 'locked' | 'unlocked' | 'checking';

export function SafeWidget() {
  const [view, setView] = useState<ViewState>('path');
  const [safePath, setSafePath] = useState('');
  const [password, setPassword] = useState('');
  const [safeStatus, setSafeStatus] = useState<SafeStatus>('checking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Window drag functionality for frameless window
  const handleDragStart = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const window = getCurrentWindow();
      await window.startDragging();
    } catch (err) {
      console.error('Drag error:', err);
    }
  };

  // Close window
  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const window = getCurrentWindow();
      await window.close();
    } catch (err) {
      console.error('Close error:', err);
    }
  };

  // Check safe status when entering manager view
  useEffect(() => {
    if (view === 'manager' && safePath) {
      checkSafeStatus();
    }
  }, [view, safePath]);

  const checkSafeStatus = async () => {
    setSafeStatus('checking');
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const isEncrypted = await invoke<boolean>('check_safe_status', { path: safePath });
      setSafeStatus(isEncrypted ? 'locked' : 'unlocked');
    } catch (err) {
      console.error('Error checking safe status:', err);
      setSafeStatus('unlocked');
    }
  };

  const handlePathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safePath.trim()) return;
    
    setIsProcessing(true);
    setMessage(null);

    try {
      const { exists } = await import('@tauri-apps/plugin-fs');
      const pathExists = await exists(safePath);

      if (pathExists) {
        setView('password');
      } else {
        setMessage({ type: 'error', text: 'Path not found' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid path' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setView('manager');
    setMessage(null);
  };

  const handleEncrypt = async () => {
    if (safeStatus === 'locked' || isProcessing) return;
    
    setIsProcessing(true);
    setMessage(null);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('encrypt_directory', { path: safePath, password });
      setSafeStatus('locked');
      setMessage({ type: 'success', text: 'Encrypted!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (safeStatus === 'unlocked' || isProcessing) return;
    
    setIsProcessing(true);
    setMessage(null);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('decrypt_directory', { path: safePath, password });
      setSafeStatus('unlocked');
      setMessage({ type: 'success', text: 'Decrypted!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (view === 'password') {
      setView('path');
      setPassword('');
    } else if (view === 'manager') {
      setView('path');
      setPassword('');
      setSafePath('');
    }
    setMessage(null);
  };

  return (
    <div className="h-full w-full  rounded-2xl  overflow-hidden p-1">
      {/* Main Widget Container */}
      
      <div className="h-full w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col">
        
        {/* Header Bar - Draggable */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50 cursor-move select-none"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <img src={safeIcon} alt="Safe" className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Safe</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button 
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
            >
              <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 flex items-center">
          
          {/* Path Input View */}
          {view === 'path' && (
            <form onSubmit={handlePathSubmit} className="w-full flex items-center gap-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={safePath}
                  onChange={(e) => setSafePath(e.target.value)}
                  placeholder="Enter safe directory path..."
                  className="w-full h-9 px-3 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !safePath.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white" />
                )}
              </button>
            </form>
          )}

          {/* Password Input View */}
          {view === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />
              </button>

              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full h-9 px-3 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!password.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </form>
          )}

          {/* Manager View */}
          {view === 'manager' && (
            <div className="w-full flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />
              </button>

              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {safeStatus === 'checking' ? (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : safeStatus === 'locked' ? (
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>

              {/* Path Display */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {safePath}
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {safeStatus === 'checking' ? 'Checking...' : safeStatus === 'locked' ? 'Encrypted' : 'Unlocked'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {/* Encrypt Button */}
                <button
                  onClick={handleEncrypt}
                  disabled={isProcessing || safeStatus === 'locked' || safeStatus === 'checking'}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isProcessing && safeStatus === 'unlocked' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>Lock</span>
                </button>

                {/* Decrypt Button */}
                <button
                  onClick={handleDecrypt}
                  disabled={isProcessing || safeStatus === 'unlocked' || safeStatus === 'checking'}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isProcessing && safeStatus === 'locked' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                  <span>Unlock</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Message Bar */}
        {message && (
          <div className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
