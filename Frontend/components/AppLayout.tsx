'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { useHousehold } from '@/lib/hooks';
import { VoiceFAB } from '@/components/VoiceFAB';
import {
  LayoutDashboard,
  CalendarClock,
  Pill,
  Baby,
  Heart,
  MapPin,
  Users,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

var navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/timeline', label: 'Health Timeline', icon: CalendarClock },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/pregnancy', label: 'Pregnancy Care', icon: Heart },
  { path: '/growth', label: 'Growth Tracking', icon: Baby },
  { path: '/care', label: 'Nearby Care', icon: MapPin },
  { path: '/dependents', label: 'Family Members', icon: Users },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  var { logout } = useAuthStore();
  var { data: household } = useHousehold();
  var pathname = usePathname();
  var router = useRouter();
  var [mobileNav, setMobileNav] = useState(false);

  var handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900/80 border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/images/logo-icon.png" alt="" className="w-8 h-8 rounded-lg" />
            <span className="font-heading font-800 text-lg text-white">
              Vaxi<span className="text-teal-400">Babu</span>
              <span className="text-teal-300 text-xs font-600 ml-0.5"></span>
            </span>
          </Link>
        </div>

        <div className="p-3 mx-3 mt-3 bg-surface-800/60 rounded-xl border border-white/[0.04]">
          <p className="text-xs text-white/30 mb-1">Family</p>
          <p className="text-sm font-heading font-700 text-white">{household?.family_name || household?.name || '...'} Family</p>
          <p className="text-xs text-teal-400">{household?.language || household?.primary_language || ''}</p>
        </div>

        <nav className="flex-1 p-3 mt-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            var active = pathname?.startsWith(item.path) || false;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-coral-400 hover:bg-coral-500/10 w-full transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-950/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setMobileNav(true)} className="p-2 text-white/60">
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/images/logo-icon.png" alt="" className="w-7 h-7 rounded-lg" />
            <span className="font-heading font-700 text-sm text-white">Well<span className="text-teal-400">Sync</span></span>
          </Link>
          <div className="w-9" />
        </div>
      </div>

      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setMobileNav(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 left-0 w-72 bg-surface-900 z-50 lg:hidden border-r border-white/[0.06] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <span className="font-heading font-700 text-white">Well<span className="text-teal-400">Sync</span> AI</span>
                <button onClick={() => setMobileNav(false)} className="p-1 text-white/40"><X size={20} /></button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  var active = pathname?.startsWith(item.path) || false;
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setMobileNav(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-teal-500/15 text-teal-400' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
                      <item.icon size={18} />{item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-white/[0.06]">
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-coral-400 w-full">
                  <LogOut size={18} />Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>

      <VoiceFAB />
    </div>
  );
}
