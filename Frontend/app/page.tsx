'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Activity, Mic, ShieldAlert, WifiOff, Calendar, 
  CheckCircle2, AlertCircle, Clock, ChevronRight, 
  Volume2, User, ArrowRight, Stethoscope, Pill, Sparkles
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f6fd] dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 overflow-hidden transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#f3f6fd]/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-400 rounded-[1.25rem] flex items-center justify-center shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(96,165,250,0.2),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
              <Activity className="text-white" size={24} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">WellSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <a href="#product" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Product</a>
            <a href="#features" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white dark:bg-slate-800 rounded-2xl px-3 py-2 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]">
              <select className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer appearance-none pr-4">
                <option value="en">EN</option>
                <option value="hi">HI</option>
              </select>
            </div>
            <ThemeToggle />
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 text-sm font-bold mb-8 shadow-[6px_6px_12px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]"
          >
            <Sparkles size={18} />
            <span>Playful Voice Health Memory</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-[4.5rem] font-black text-slate-800 dark:text-white leading-[1.1] tracking-tight mb-6"
          >
            Preventive care, <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
              guided by voice.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl"
          >
            WellSync transforms complex health tracking into a soft, friendly timeline. Designed with voice-first AI to make family care accessible, beautiful, and effortless.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link href="/login" className="group bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-[1.5rem] text-lg font-black transition-all shadow-[8px_8px_16px_rgba(96,165,250,0.3),inset_2px_2px_8px_rgba(255,255,255,0.5),inset_-2px_-2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] flex items-center gap-2">
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-[1.5rem] text-lg font-bold text-slate-600 dark:text-slate-300 bg-[#f3f6fd] dark:bg-slate-800 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8),inset_2px_2px_8px_rgba(255,255,255,0.9),inset_-2px_-2px_8px_rgba(0,0,0,0.02)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05),inset_2px_2px_8px_rgba(255,255,255,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[12px_12px_20px_rgba(0,0,0,0.08),-12px_-12px_20px_rgba(255,255,255,0.9),inset_2px_2px_8px_rgba(255,255,255,0.9),inset_-2px_-2px_8px_rgba(0,0,0,0.02)] dark:hover:shadow-[12px_12px_20px_rgba(0,0,0,0.4),-12px_-12px_20px_rgba(255,255,255,0.05),inset_2px_2px_8px_rgba(255,255,255,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.4)] active:translate-y-0.5 transition-all">
              See how it works
            </a>
          </motion.div>
        </div>

        {/* Hero Right: Claymorphism UI Composition */}
        <div className="relative h-[500px] lg:h-[600px] w-full flex items-center justify-center">
          {/* Base Timeline Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-full max-w-md bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] shadow-[15px_15px_30px_rgba(0,0,0,0.05),-15px_-15px_30px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[15px_15px_30px_rgba(0,0,0,0.4),-15px_-15px_30px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] p-8 z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl text-slate-800 dark:text-white">Health Timeline</h3>
              <span className="text-sm font-bold text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-4 py-1.5 rounded-xl shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]">This Week</span>
            </div>
            <div className="space-y-5">
              <div className="flex gap-5 bg-[#f3f6fd] dark:bg-slate-800 p-5 rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400 flex items-center justify-center shrink-0 shadow-[4px_4px_8px_rgba(52,211,153,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)]">
                  <CheckCircle2 className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Vitamin D</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed • 8:00 AM</p>
                </div>
              </div>
              <div className="flex gap-5 bg-[#f3f6fd] dark:bg-slate-800 p-5 rounded-3xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)]">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center shrink-0 shadow-[4px_4px_8px_rgba(251,191,36,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)]">
                  <Clock className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Polio Booster</p>
                  <p className="text-sm font-bold text-amber-500 dark:text-amber-400">Due Tomorrow</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Profile Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 20 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="absolute top-12 -right-4 lg:-right-8 w-64 bg-white dark:bg-slate-800 rounded-[2rem] shadow-[15px_15px_30px_rgba(0,0,0,0.05),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[15px_15px_30px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] p-5 z-20 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 dark:bg-slate-700 overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] p-1">
              <img src="https://picsum.photos/seed/aarav/100/100" alt="Aarav" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 dark:text-white">Aarav Sharma</p>
              <p className="text-sm font-bold text-blue-400">Child • 4 years</p>
            </div>
          </motion.div>

          {/* Floating Voice Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 30 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="absolute -bottom-10 right-10 w-80 bg-blue-400 dark:bg-blue-500 rounded-[2rem] shadow-[15px_15px_30px_rgba(96,165,250,0.3),inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.1)] dark:shadow-[15px_15px_30px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.2),inset_-4px_-4px_10px_rgba(0,0,0,0.3)] p-6 z-30 flex items-center gap-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-[4px_4px_8px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
              <Mic className="text-blue-500 dark:text-blue-400" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-bold text-white">&quot;Aarav took his medicine.&quot;</p>
              <p className="text-sm font-medium text-blue-100 dark:text-blue-200 mt-1 flex items-center gap-1"><Sparkles size={14}/> Logging...</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-white/50 dark:border-slate-800/50 bg-[#f3f6fd] dark:bg-slate-900 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap justify-center md:justify-between items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2"><Mic size={20} className="text-blue-400"/> Voice-first</div>
          <div className="flex items-center gap-2"><WifiOff size={20} className="text-blue-400"/> Offline-friendly</div>
          <div className="flex items-center gap-2"><User size={20} className="text-blue-400"/> Family-focused</div>
          <div className="flex items-center gap-2"><Volume2 size={20} className="text-blue-400"/> Multilingual-ready</div>
          <div className="flex items-center gap-2"><Calendar size={20} className="text-blue-400"/> Timeline-based</div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 relative z-10 bg-[#f3f6fd] dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-6">
              Everything you need, <span className="text-blue-500 dark:text-blue-400">nothing you don&apos;t.</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Designed specifically to reduce cognitive load and support low-literacy environments through soft, friendly, and puffy features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[320px]">
            <div className="md:col-span-2 bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10 max-w-md">
                <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(96,165,250,0.2),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                  <Calendar className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Automated Health Timeline</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg">We automatically generate a structured, visual timeline of required vaccines and checkups based on age and local health guidelines.</p>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-80 h-80 bg-white dark:bg-slate-700 rounded-tl-[3rem] shadow-[10px_10px_20px_rgba(0,0,0,0.05),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] p-8 opacity-80 group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-500">
                <div className="w-full h-8 bg-[#f3f6fd] dark:bg-slate-800 rounded-full mb-6 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]"></div>
                <div className="w-3/4 h-8 bg-[#f3f6fd] dark:bg-slate-800 rounded-full mb-10 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]"></div>
                <div className="w-full h-20 bg-blue-100 dark:bg-blue-900/50 rounded-3xl shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]"></div>
              </div>
            </div>

            <div className="bg-purple-400 dark:bg-purple-500 rounded-[2.5rem] p-10 shadow-[10px_10px_20px_rgba(168,85,247,0.2),inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.2),inset_-4px_-4px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.1),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                  <Mic className="text-purple-500 dark:text-purple-400" size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4">Voice-First</h3>
                <p className="text-purple-100 dark:text-purple-200 font-medium leading-relaxed text-lg">Interact entirely through voice. Ask questions, log medicines, and hear explanations.</p>
              </div>
            </div>

            <div className="bg-[#f3f6fd] dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                  <WifiOff className="text-slate-400 dark:text-slate-300" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Offline Support</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg">Core timeline features and reminders work perfectly even in low-connectivity environments.</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-emerald-400 dark:bg-emerald-500 rounded-[2.5rem] p-10 shadow-[10px_10px_20px_rgba(52,211,153,0.2),inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.2),inset_-4px_-4px_10px_rgba(0,0,0,0.3)] flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10 max-w-md">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.1),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                  <ShieldAlert className="text-emerald-500 dark:text-emerald-400" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Medicine Caution Checks</h3>
                <p className="text-emerald-50 dark:text-emerald-100 font-medium leading-relaxed text-lg">Scan a medicine strip to instantly hear what it is, how to take it, and if it conflicts with existing prescriptions.</p>
              </div>
              <div className="absolute right-8 bottom-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                <Pill size={160} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Demo Section */}
      <section id="demo" className="py-32 relative z-10 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#f3f6fd] dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 shadow-[15px_15px_30px_rgba(0,0,0,0.05),-15px_-15px_30px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[15px_15px_30px_rgba(0,0,0,0.4),-15px_-15px_30px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            <div className="relative z-10 max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 text-slate-800 dark:text-white">Experience the interaction.</h2>
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">A conversational interface that feels natural and intelligent.</p>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex items-start gap-4 mb-10">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-[6px_6px_12px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                  <User size={24} className="text-slate-400 dark:text-slate-500" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl rounded-tl-none p-6 text-lg font-bold text-slate-700 dark:text-slate-200 shadow-[6px_6px_12px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                  &quot;What vaccine is due next for Aarav?&quot;
                </div>
              </div>

              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="w-14 h-14 rounded-[1.25rem] bg-blue-400 dark:bg-blue-500 flex items-center justify-center shrink-0 shadow-[6px_6px_12px_rgba(96,165,250,0.3),inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.3)]">
                  <Activity size={24} className="text-white" />
                </div>
                <div className="bg-blue-400 dark:bg-blue-500 rounded-3xl rounded-tr-none p-8 text-white shadow-[10px_10px_20px_rgba(96,165,250,0.2),inset_4px_4px_10px_rgba(255,255,255,0.3),inset_-4px_-4px_10px_rgba(0,0,0,0.1)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),inset_4px_4px_10px_rgba(255,255,255,0.2),inset_-4px_-4px_10px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Volume2 size={20} className="text-blue-100 dark:text-blue-200" />
                    <span className="text-xs font-black text-blue-100 dark:text-blue-200 uppercase tracking-wider">Audio Response</span>
                  </div>
                  <p className="text-xl font-bold leading-relaxed mb-8">
                    Aarav is due for his Polio booster this week. It is important to protect him against the polio virus. Would you like me to set a reminder for tomorrow morning?
                  </p>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4)]">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800 dark:text-white">Polio Booster</p>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Due this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative z-10 bg-[#f3f6fd] dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-8">Ready to simplify family health?</h2>
          <p className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-12">Explore the prototype and see how soft, playful, voice-first design makes preventive care accessible for everyone.</p>
          <Link href="/login" className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-5 rounded-[2rem] text-xl font-black transition-all shadow-[10px_10px_20px_rgba(96,165,250,0.3),inset_4px_4px_10px_rgba(255,255,255,0.5),inset_-4px_-4px_10px_rgba(0,0,0,0.1)] hover:-translate-y-1 active:translate-y-1 active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1)]">
            Launch Dashboard <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-12 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center shadow-[4px_4px_10px_rgba(96,165,250,0.4),inset_2px_2px_6px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_10px_rgba(96,165,250,0.2),inset_2px_2px_6px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
              <Activity className="text-white" size={20} strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white">WellSync</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Contact</a>
          </div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} WellSync AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
