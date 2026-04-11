'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-[4px_4px_10px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] transition-all"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
    </button>
  );
}
