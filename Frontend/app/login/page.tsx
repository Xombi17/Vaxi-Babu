'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Activity, ArrowRight, Home, ShieldCheck, Sparkles } from 'lucide-react';

const families = [
  { id: 'sharma', name: 'Sharma Family', color: 'bg-blue-400', icon: '🏠', city: 'Noida' },
  { id: 'patel', name: 'Patel Family', color: 'bg-emerald-400', icon: '🏡', city: 'Ahmedabad' },
  { id: 'kumar', name: 'Kumar Family', color: 'bg-amber-400', icon: '🏢', city: 'Patna' },
  { id: 'singh', name: 'Singh Family', color: 'bg-purple-400', icon: '🏰', city: 'Amritsar' },
  { id: 'verma', name: 'Verma Family', color: 'bg-rose-400', icon: '🏘️', city: 'Indore' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDemoLogin = async (username: string) => {
    setLoading(username);
    try {
      // Use the API_URL from env or fallback to 8080
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: 'REMOVED_DEMO_PASSWORD',
        }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      
      // Store auth state
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('household_id', data.household_id);
      localStorage.setItem('family_name', families.find(f => f.id === username)?.name || 'Family');

      router.push('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Failed to connect to backend. Make sure it is running on port 8080.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fd] dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center shadow-[6px_6px_12px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)]">
              <Activity className="text-white" size={32} strokeWidth={3} />
            </div>
            <span className="text-4xl font-black tracking-tight">WellSync</span>
          </motion.div>
          
          <h1 className="text-4xl font-black mb-4 tracking-tight">Select a Demo Family</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            Welcome to the demo. Access pre-seeded health records for each family with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {families.map((family, idx) => (
            <motion.button
              key={family.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleDemoLogin(family.id)}
              disabled={!!loading}
              className="group relative flex flex-col items-center p-8 rounded-[2.5rem] bg-[#f3f6fd] dark:bg-slate-800 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 overflow-hidden"
            >
              <div className={`w-20 h-20 ${family.color} rounded-3xl flex items-center justify-center mb-6 shadow-[6px_6px_12px_rgba(0,0,0,0.1),inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] text-4xl group-hover:scale-110 transition-transform`}>
                {family.icon}
              </div>
              <h3 className="font-black text-lg mb-1">{family.name}</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{family.city}</p>
              
              {loading === family.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f3f6fd]/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-20 text-center">
            <button 
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-blue-500 transition-colors"
            >
                <Home size={18} /> Back to Landing Page
            </button>
        </div>
      </div>
      
      <div className="fixed bottom-10 flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50">
        <ShieldCheck className="text-emerald-500" size={20} />
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Secure JWT Authentication Enabled</span>
      </div>
    </div>
  );
}
