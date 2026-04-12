import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import LandingClient from '@/components/LandingClient';
import PwaInstallNotice from '@/components/landing/PwaInstallNotice';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-raleway text-slate-800 dark:text-slate-100 overflow-x-hidden relative">
      {/* PWA Notice */}
      <PwaInstallNotice />
      
      {/* Accessible Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-[1rem] flex items-center justify-center shadow-lg relative overflow-hidden">
              <Activity className="text-white relative z-10" size={20} strokeWidth={3} />
            </div>
            <span className="text-2xl font-lora font-black tracking-tight text-primary dark:text-secondary">WellSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-400">
            <Link href="/features/voice-engine" className="hover:text-primary dark:hover:text-secondary transition-colors focus-visible:ring-3 rounded-sm outline-hidden">Voice UI</Link>
            <Link href="/features/medicine-safety" className="hover:text-primary dark:hover:text-secondary transition-colors focus-visible:ring-3 rounded-sm outline-hidden">Safety</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors focus-visible:ring-3 rounded-sm outline-hidden">
              Sign in
            </Link>
            <Link href="/login" className="bg-cta hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all focus-visible:ring-3 outline-hidden">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* The interactive client boundaries */}
      <main>
        <LandingClient />
      </main>

      {/* Minimal Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-10 relative z-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-slate-500 hover:text-primary transition-colors focus-visible:ring-3 rounded-sm outline-hidden cursor-pointer">
            <Activity size={20} />
            <span className="text-xl font-lora font-black tracking-tight">WellSync</span>
          </div>
          <p className="text-sm font-bold text-slate-500">
            © {new Date().getFullYear()} WellSync AI. Accessible Healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
}
