'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Shield,
  LogOut,
  Menu,
  X,
  Loader2,
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
  { path: '/chw', label: 'CHW Field Mode', icon: Shield, chwOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

var bottomNavItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/timeline', label: 'Timeline', icon: CalendarClock },
  { path: '/medicines', label: 'Meds', icon: Pill },
  { path: '/dependents', label: 'Family', icon: Users },
  { path: '/chw', label: 'CHW', icon: Shield, chwOnly: true },
];

export function AppLayout({ children }: { children: ReactNode }) {
  var { logout, chwMode } = useAuthStore();
  var { data: household } = useHousehold();
  var pathname = usePathname();
  var router = useRouter();
  var [mobileNav, setMobileNav] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Onboarding Redirect Logic
  useEffect(() => {
    if (household && !household.last_onboarded_at && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [household, pathname, router]);

  return (
    <div className="min-h-screen bg-surface-950 flex w-full max-w-[100vw] overflow-x-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900/80 border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/images/logo-icon.png" alt="Vaxi Babu Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-heading font-800 text-lg text-white">
              Vaxi<span className="text-teal-400">Babu</span>
              <span className="text-teal-300 text-xs font-600 ml-0.5"></span>
            </span>
          </Link>
        </div>

        <div className="p-4 mx-3 mt-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Family Profile</p>
            <div className={`w-1.5 h-1.5 rounded-full ${household ? 'bg-teal-500' : 'bg-white/10 animate-pulse'}`} />
          </div>
          
          {household ? (
            <div className="space-y-1">
              <p className="text-sm font-heading font-800 text-white truncate leading-none">
                {household.name || 'WellSync'} Family
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                <MapPin size={10} className="text-teal-500/50" />
                <span className="truncate">
                  {household.village_town || household.district || 'Location not set'}
                  {household.state ? `, ${household.state}` : ''}
                </span>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/20">
                  {household.primary_language || 'English'}
                </span>
                <span className="text-[10px] text-white/20 font-medium truncate">
                  ID: {household.id.slice(0, 8)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/5 animate-pulse rounded-md" />
              <div className="h-3 w-24 bg-white/5 animate-pulse rounded-md" />
              <div className="h-4 w-16 bg-white/5 animate-pulse rounded-md mt-2" />
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 mt-2 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => !('chwOnly' in item) || chwMode).map((item) => {
            var active = pathname?.startsWith(item.path) || false;
            const isChw = 'chwOnly' in item;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? isChw ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    : isChw ? 'text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10 border border-transparent' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {isChw && <span className="ml-auto text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-md">WORKER</span>}
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
            <Image src="/images/logo-icon.png" alt="Vaxi Babu Logo" width={28} height={28} className="rounded-lg" />
            <span className="font-heading font-700 text-sm text-white">Vaxi<span className="text-teal-400">Babu</span></span>
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
                <span className="font-heading font-700 text-white">Vaxi<span className="text-teal-400">Babu</span></span>
                <button onClick={() => setMobileNav(false)} className="p-1 text-white/40"><X size={20} /></button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.filter(item => !('chwOnly' in item) || chwMode).map((item) => {
                  var active = pathname?.startsWith(item.path) || false;
                  const isChw = 'chwOnly' in item;
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setMobileNav(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? isChw ? 'bg-orange-500/15 text-orange-400' : 'bg-teal-500/15 text-teal-400'
                          : isChw ? 'text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                      }`}>
                      <item.icon size={18} />{item.label}
                      {isChw && <span className="ml-auto text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-md">WORKER</span>}
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

      <main className="flex-1 min-w-0 lg:ml-64 min-h-screen">
        <div className="pt-16 pb-20 lg:pt-0 lg:pb-0 w-full">
          {children}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-950/90 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.filter(item => !('chwOnly' in item) || chwMode).map((item) => {
            var active = pathname?.startsWith(item.path) || false;
            const isChw = 'chwOnly' in item;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                  active
                    ? isChw ? 'text-orange-400' : 'text-teal-400'
                    : isChw ? 'text-orange-400/40 hover:text-orange-400' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <item.icon size={20} className={active ? (isChw ? 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' : 'drop-shadow-[0_0_8px_rgba(32,223,200,0.5)]') : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <VoiceFAB />
    </div>
  );
}
