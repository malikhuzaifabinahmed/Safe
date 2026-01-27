import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, FolderOpen, Lock } from 'lucide-react';
import safeIcon from '@/assets/icon.png';

interface SafePathInputProps {
  onAuthenticated: (path: string, password: string) => void;
}

export function SafePathInput({ onAuthenticated }: SafePathInputProps) {
  const [safePath, setSafePath] = useState('');
  const [password, setPassword] = useState('');
  const [isPathVerified, setIsPathVerified] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handlePathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const { exists } = await import('@tauri-apps/plugin-fs');
      
      console.log('Checking path:', safePath);
      const pathExists = await exists(safePath);
      console.log('Path exists:', pathExists);

      if (pathExists) {
        setIsPathVerified(true);
      } else {
        setError('The specified path does not exist. Please check and try again.');
      }
    } catch (err) {
      console.error('Path validation error:', err);
      setError('Failed to validate path: ' + (err as Error).message);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onAuthenticated(safePath, password);
    }
  };

  const handleBack = () => {
    setIsPathVerified(false);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-60 animate-pulse" />
            <div className="relative p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img src={safeIcon} alt="Safe" className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Safe
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Secure File Encryption
          </p>
        </div>

        {/* Card Container */}
        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${
              !isPathVerified ? 'bg-blue-500 w-8' : 'bg-slate-300 dark:bg-slate-700'
            }`} />
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${
              isPathVerified ? 'bg-blue-500 w-8' : 'bg-slate-300 dark:bg-slate-700'
            }`} />
          </div>

          {!isPathVerified ? (
            <form onSubmit={handlePathSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-3 animate-bounce">
                  <FolderOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Choose Your Safe
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Select a directory to protect
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  id="safePath"
                  type="text"
                  placeholder="C:\MySafe"
                  value={safePath}
                  onChange={(e) => setSafePath(e.target.value)}
                  required
                  className="h-12 px-4 text-base font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                disabled={isValidating || !safePath.trim()}
              >
                {isValidating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validating...</span>
                  </div>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-3 animate-bounce">
                  <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Enter Password
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  This will encrypt your files
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="h-12 px-4 text-base bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 text-base rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                  disabled={!password.trim()}
                >
                  <span>Access Safe</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            AES-256 Encryption • Military Grade Security
          </p>
        </div>
      </div>
    </div>
  );
}
