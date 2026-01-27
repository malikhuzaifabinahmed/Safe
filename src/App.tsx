import { useState } from 'react';
import "./global.css"
import { SafePathInput } from './components/SafePathInput';
import { SafeManager } from './components/SafeManager';

export default function App() {
  const [safePath, setSafePath] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = (path: string, pass: string) => {
    setSafePath(path);
    setPassword(pass);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setSafePath(null);
    setPassword('');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <SafePathInput onAuthenticated={handleAuthenticated} />
      ) : safePath ? (
        <SafeManager safePath={safePath} password={password} onLogout={handleLogout} />
      ) : null}
    </div>
  );
}

