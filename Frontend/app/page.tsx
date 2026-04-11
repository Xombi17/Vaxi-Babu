import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import LandingClient from '@/components/LandingClient';

// Server Component (Default for Next.js Best Practices)
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      {/* Navigation (Can remain Server / Static) */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#020617]/40 backdrop-blur-2xl border-b border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-[1rem] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Activity className="text-white relative z-10" size={20} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">WellSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="relative group overflow-hidden bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all backdrop-blur-md">
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* The interactive client boundaries */}
      <main>
        <LandingClient />
      </main>

      {/* Minimal Footer */}
      <footer className="bg-[#020617] border-t border-white/5 py-10 relative z-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <Activity className="text-white" size={20} />
            <span className="text-xl font-black tracking-tight text-white">WellSync</span>
          </div>
          <p className="text-sm font-bold text-slate-600">
            © {new Date().getFullYear()} WellSync AI Studio.
          </p>
        </div>
      </footer>
    </div>
  );
}
