'use client';
import React from 'react';
import { Home, Camera, User, Activity, Bell, Search, Mic, Sparkles, Settings, Clock, LogOut, MapPin, Users } from 'lucide-react';
import { VoiceFAB } from './VoiceFAB';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('household_id');
    localStorage.removeItem('family_name');
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#f3f6fd] dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 overflow-hidden relative transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-[#f3f6fd] dark:bg-slate-900 border-r border-white/50 dark:border-slate-800/50 px-6 py-8 z-20 relative shadow-[10px_0_20px_rgba(0,0,0,0.02)] dark:shadow-[10px_0_20px_rgba(0,0,0,0.4)] transition-colors duration-300">
        <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 bg-blue-400 rounded-[1.25rem] flex items-center justify-center shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(96,165,250,0.2),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
            <Activity className="text-white" size={24} strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">WellSync</span>
        </Link>

        <nav className="flex-1 space-y-3 overflow-y-auto pb-4">
          <NavItem href="/dashboard" icon={Home} label="Dashboard" active={isActive('/dashboard')} />
          <NavItem href="/care" icon={MapPin} label="Nearby Care" active={isActive('/care')} />
          <NavItem href="/dependents" icon={User} label="Dependents" active={isActive('/dependents')} />
          <NavItem href="/medicine" icon={Camera} label="Medicine Scanner" active={isActive('/medicine')} />
          <NavItem href="/reminders" icon={Clock} label="Reminders" active={isActive('/reminders')} />
          <NavItem href="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-auto"
          >
            <LogOut size={24} strokeWidth={2.5} />
            Sign Out
          </button>
        </nav>

        <div className="mt-auto pt-4 bg-blue-400 dark:bg-blue-500 rounded-[2rem] p-6 text-center shadow-[10px_10px_20px_rgba(96,165,250,0.2),inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.2),inset_-4px_-4px_10px_rgba(0,0,0,0.3)] relative overflow-hidden group shrink-0">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_10px_rgba(0,0,0,0.1),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
              <Mic className="text-blue-500 dark:text-blue-400" size={24} strokeWidth={3} />
            </div>
            <h4 className="font-black text-white mb-2 flex justify-center items-center gap-1"><Sparkles size={16} className="text-blue-100 dark:text-blue-200"/> Voice Assistant</h4>
            <p className="text-sm font-medium text-blue-100 dark:text-blue-200 mb-2">Tap the mic to log medicine or ask health questions.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="bg-[#f3f6fd]/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(96,165,250,0.2),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
              <Activity className="text-white" size={20} strokeWidth={3} />
            </div>
            <span className="text-xl font-black text-slate-800 dark:text-white">WellSync</span>
          </div>

          <div className="hidden md:flex items-center bg-white dark:bg-slate-800 rounded-2xl px-5 py-3 w-96 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)] focus-within:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] dark:focus-within:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] transition-all">
            <Search className="text-slate-400 dark:text-slate-500 mr-3" size={20} strokeWidth={2.5} />
            <input type="text" placeholder="Search medicines, events..." className="bg-transparent border-none outline-none w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold" />
          </div>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link href="/reminders" className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors relative shadow-[4px_4px_10px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] dark:active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]">
              <Bell size={22} strokeWidth={2.5} />
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-400 rounded-full border-2 border-white shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span>
            </Link>
            <Link href="/settings" className="w-12 h-12 rounded-[1.25rem] bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] p-1 overflow-hidden block">
              <img src="https://picsum.photos/seed/family/100/100" alt="Profile" className="w-full h-full object-cover rounded-xl" />
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-[2rem]">
        <MobileNavItem href="/dashboard" icon={Home} label="Home" active={isActive('/dashboard')} />
        <MobileNavItem href="/care" icon={MapPin} label="Care" active={isActive('/care')} />
        <MobileNavItem href="/dependents" icon={User} label="Family" active={isActive('/dependents')} />
        <MobileNavItem href="/medicine" icon={Camera} label="Scan" active={isActive('/medicine')} />
        <MobileNavItem href="/reminders" icon={Clock} label="Stats" active={isActive('/reminders')} />
      </div>

      {/* Mobile Voice FAB */}
      <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <VoiceFAB />
      </div>

      {/* Desktop Voice FAB */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <VoiceFAB />
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${
        active 
          ? 'bg-white text-blue-500 shadow-[6px_6px_12px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)]' 
          : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
      }`}
    >
      <Icon size={24} strokeWidth={active ? 3 : 2.5} />
      {label}
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center p-2 transition-colors ${active ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`p-2 rounded-xl mb-1 ${active ? 'bg-blue-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]' : ''}`}>
        <Icon size={24} strokeWidth={active ? 3 : 2.5} />
      </div>
      <span className="text-[11px] font-black">{label}</span>
    </Link>
  );
}
