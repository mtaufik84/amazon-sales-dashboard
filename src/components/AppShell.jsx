import { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import CommandPalette from './CommandPalette.jsx';

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenCommand={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
