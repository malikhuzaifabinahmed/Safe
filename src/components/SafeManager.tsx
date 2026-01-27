import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import safeIcon from '@/assets/icon.png';

interface SafeManagerProps {
  safePath: string;
  password: string;
  onLogout: () => void;
}

export function SafeManager({ safePath, password, onLogout }: SafeManagerProps) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [safeStatus, setSafeStatus] = useState<'locked' | 'unlocked'>('unlocked');

  // Check safe status on mount
  useEffect(() => {
    checkSafeStatus();
  }, [safePath]);

  const checkSafeStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const isEncrypted = await invoke<boolean>('check_safe_status', {
        path: safePath,
      });
      setSafeStatus(isEncrypted ? 'locked' : 'unlocked');
      console.log('Safe status:', isEncrypted ? 'encrypted' : 'not encrypted');
    } catch (err) {
      console.error('Error checking safe status:', err);
      setSafeStatus('unlocked');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleEncrypt = async () => {
    if (safeStatus === 'locked') {
      setStatus('error');
      setMessage('Safe is already encrypted! Decrypt it first before encrypting again.');
      return;
    }

    setIsEncrypting(true);
    setStatus('idle');
    setMessage('');

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      
      console.log('Starting encryption for:', safePath);
      const result = await invoke('encrypt_directory', {
        path: safePath,
        password: password,
      });

      console.log('Encryption result:', result);
      setStatus('success');
      setMessage('Successfully encrypted all files in the safe directory!');
      setSafeStatus('locked');
    } catch (err) {
      console.error('Encryption error:', err);
      setStatus('error');
      setMessage('Encryption failed: ' + (err as Error).message);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (safeStatus === 'unlocked') {
      setStatus('error');
      setMessage('Safe is already unlocked! No need to decrypt.');
      return;
    }

    setIsDecrypting(true);
    setStatus('idle');
    setMessage('');

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      
      console.log('Starting decryption for:', safePath);
      const result = await invoke('decrypt_directory', {
        path: safePath,
        password: password,
      });

      console.log('Decryption result:', result);
      setStatus('success');
      setMessage('Successfully decrypted all files in the safe directory!');
      setSafeStatus('unlocked');
    } catch (err) {
      console.error('Decryption error:', err);
      setStatus('error');
      setMessage('Decryption failed: ' + (err as Error).message);
    } finally {
      setIsDecrypting(false);
    }
  };

  const dismissMessage = () => {
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <img src={safeIcon} alt="Safe" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Safe Manager</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isCheckingStatus ? 'Checking status...' : `Status: ${safeStatus === 'locked' ? 'Encrypted' : 'Unlocked'}`}
              </p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Safe Directory</p>
              <p className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-lg truncate">
                {safePath}
              </p>
            </div>
            <div className="ml-4">
              {isCheckingStatus ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-600 dark:text-slate-400" />
                </div>
              ) : (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  safeStatus === 'locked' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                  {safeStatus === 'locked' ? (
                    <>
                      <Lock className="w-5 h-5" />
                      <span className="font-semibold text-sm">Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5" />
                      <span className="font-semibold text-sm">Unlocked</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            status === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'
          }`}>
            {status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <p className={`flex-1 text-sm font-medium ${
              status === 'success' 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {message}
            </p>
            <button
              onClick={dismissMessage}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: '100ms' }}>
          {/* Encrypt Button */}
          <button
            onClick={handleEncrypt}
            disabled={isEncrypting || isDecrypting || isCheckingStatus || safeStatus === 'locked'}
            className={`group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              safeStatus === 'unlocked' && !isEncrypting && !isDecrypting && !isCheckingStatus
                ? 'hover:shadow-2xl hover:border-red-300 dark:hover:border-red-700'
                : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                {isEncrypting && (
                  <Loader2 className="w-5 h-5 animate-spin text-red-600 dark:text-red-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {safeStatus === 'locked' ? 'Already Encrypted' : 'Encrypt Files'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isEncrypting ? 'Encrypting your files...' : 'Lock all files with AES-256 encryption'}
              </p>
            </div>
          </button>

          {/* Decrypt Button */}
          <button
            onClick={handleDecrypt}
            disabled={isEncrypting || isDecrypting || isCheckingStatus || safeStatus === 'unlocked'}
            className={`group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              safeStatus === 'locked' && !isEncrypting && !isDecrypting && !isCheckingStatus
                ? 'hover:shadow-2xl hover:border-green-300 dark:hover:border-green-700'
                : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Unlock className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                {isDecrypting && (
                  <Loader2 className="w-5 h-5 animate-spin text-green-600 dark:text-green-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {safeStatus === 'unlocked' ? 'Already Unlocked' : 'Decrypt Files'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isDecrypting ? 'Decrypting your files...' : 'Unlock files and restore access'}
              </p>
            </div>
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            🔒 Military-grade AES-256-GCM encryption with SHA-256 key derivation
          </p>
        </div>
      </div>
    </div>
  );
}
