import "./global.css"
import { SafeWidget } from './components/SafeWidget';

export default function App() {
  return (
    <div className="h-screen w-screen bg-transparent overflow-hidden">
      <SafeWidget />
    </div>
  );
}

