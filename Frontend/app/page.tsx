import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import LandingClient from '@/components/LandingClient';
import PwaInstallNotice from '@/components/landing/PwaInstallNotice';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] font-raleway text-slate-100 overflow-x-hidden relative">
      {/* PWA Notice */}
      <PwaInstallNotice />
      
      {/* Premium Glass Navigation */}
      <nav className="fixed top-8 inset-x-6 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center bg-[#0F172A]/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
              <Activity className="text-[#0F172A]" size={22} strokeWidth={3} />
            </div>
            <span className="text-2xl font-lora font-black tracking-tight text-white hidden sm:block">WellSync</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-slate-400">
              <a href="#features" className="hover:text-secondary transition-colors">Platform</a>
              <a href="#about" className="hover:text-secondary transition-colors">Our Vision</a>
            </div>
            
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <Link href="/login" className="bg-white text-[#0F172A] px-8 py-3 rounded-full text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-xl">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main>
        <LandingClient />
      </main>

      {/* Footer is handled inside LandingClient for seamless flow */}
    </div>
  );
}
