'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { 
  Activity, Mic, ShieldAlert, WifiOff, Calendar, 
  CheckCircle2, Clock, Volume2, User, ArrowRight, 
  Sparkles, Pill, ChevronRight
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Advanced Scroll Parallax
  const { scrollYProgress } = useScroll({ target: containerRef });
  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const yStars = useTransform(springScroll, [0, 1], ['0%', '100%']);
  const yHeroText = useTransform(springScroll, [0, 1], ['0%', '150%']);
  const opacityHero = useTransform(springScroll, [0, 0.5], [1, 0]);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth) * 2 - 1,
        y: -(e.clientY / innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden relative">
      {/* Background Starfield / Aurora */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-900/40 blur-[150px] rounded-full mix-blend-screen" />
        
        {/* Particle Stars */}
        <motion.div style={{ y: yStars }} className="absolute inset-0 opacity-50">
          <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full blur-[1px] shadow-[0_0_10px_#fff]" />
          <div className="absolute top-[40%] right-[30%] w-2 h-2 bg-blue-300 rounded-full blur-[2px] shadow-[0_0_15px_#3b82f6]" />
          <div className="absolute top-[70%] left-[15%] w-1.5 h-1.5 bg-indigo-300 rounded-full blur-[1px] shadow-[0_0_12px_#6366f1]" />
          <div className="absolute bottom-[20%] right-[20%] w-1 h-1 bg-white rounded-full blur-[0.5px]" />
        </motion.div>
      </div>

      {/* Navigation */}
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
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="relative group overflow-hidden bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all backdrop-blur-md">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            style={{ y: yHeroText, opacity: opacityHero }}
            className="max-w-2xl relative z-20"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold mb-8 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-blue-400" />
              <span>Next-Gen Voice Health Intelligence</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl lg:text-[5rem] font-black leading-[1.05] tracking-tighter mb-8"
            >
              Preventive care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                guided by voice.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-xl"
            >
              WellSync transforms complex health tracking into a cinematic, conversational experience. Designed with spatial UI and advanced voice AI.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/login" className="group relative overflow-hidden bg-white text-slate-950 px-8 py-4 rounded-full text-lg font-black transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2">
                Launch App
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </Link>
              <a href="#demo" className="group px-8 py-4 rounded-full text-lg font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 backdrop-blur-md">
                <Volume2 size={20} className="text-blue-400 group-hover:scale-110 transition-transform" /> Hear Demo
              </a>
            </motion.div>
          </motion.div>

          {/* 3D Holographic UI Representation */}
          <motion.div 
            className="relative lg:h-[700px] w-full flex items-center justify-center perspective-[1200px]"
          >
            <motion.div
              animate={{
                rotateX: mousePos.y * 15,
                rotateY: mousePos.x * 15,
                z: 100
              }}
              transition={{ type: "spring", stiffness: 75, damping: 20 }}
              className="relative w-full max-w-md aspect-[3/4] preserve-3d"
            >
               {/* Glowing Base Glass Sphere/Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/40 blur-[80px] rounded-full" />
              
              {/* Floating Hologram Card 1 (Timeline) */}
              <motion.div 
                className="absolute top-[10%] left-[5%] right-[5%] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]"
                style={{ transform: "translateZ(80px)" }}
              >
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-blue-400"/>
                    <h3 className="font-bold text-sm text-white">Live Diagnostics</h3>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                
                 <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <p className="text-white font-black text-lg">Vitamin D Synced</p>
                      <p className="text-slate-400 text-xs">Aarav • Processed via Voice</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Hologram Card 2 (Voice Transcript) */}
              <motion.div 
                className="absolute bottom-[20%] right-[-10%] w-[80%] bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]"
                style={{ transform: "translateZ(120px)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                    <Mic className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">"Did you give him the medicine?"</p>
                    <div className="flex gap-1 mt-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Hologram Card 3 (Scan) */}
              <motion.div 
                className="absolute top-[60%] left-[-20%] w-[60%] bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                style={{ transform: "translateZ(160px)" }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scan" />
                   <Pill size={32} className="text-cyan-400 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
                <p className="text-center text-xs text-slate-300 font-bold mt-2">Safe • No Conflicts</p>
              </motion.div>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-white/5 bg-white/5 backdrop-blur-md relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-between items-center gap-8 text-sm font-bold text-slate-400">
          <motion.div whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-2 cursor-pointer transition-colors"><Mic size={18} className="text-blue-400"/> Voice-First AI</motion.div>
          <motion.div whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-2 cursor-pointer transition-colors"><ShieldAlert size={18} className="text-emerald-400"/> Realtime OCR Safety</motion.div>
          <motion.div whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-2 cursor-pointer transition-colors"><WifiOff size={18} className="text-indigo-400"/> Low Network Ready</motion.div>
          <motion.div whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-2 cursor-pointer transition-colors"><Volume2 size={18} className="text-purple-400"/> Polyglot Support</motion.div>
        </div>
      </section>

      {/* Cinematic Features Grid */}
      <section id="features" className="py-40 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-24 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-6">
              Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Empathy</span>
            </h2>
            <p className="text-xl text-slate-400">Built to remove friction. Advanced spatial interfaces and state-of-the-art voice engines work seamlessly behind profound simplicity.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-2 group relative rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden transform transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-10 h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                    <Calendar className="text-blue-400" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Timeline Architecture</h3>
                  <p className="text-slate-400 leading-relaxed max-w-md">Instantly generates a structured, chronological health plan. Predictive models alert you to upcoming checkups before you even need to ask.</p>
                </div>
                
                {/* Abstract Visual */}
                <div className="mt-12 h-32 w-full relative">
                   <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20" />
                   <motion.div 
                     animate={{ x: ["0%", "100%", "0%"] }} 
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute bottom-0 w-24 h-[2px] bg-blue-400 shadow-[0_0_15px_#60a5fa]" 
                   />
                   <div className="absolute bottom-[-4px] left-1/4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                   <div className="absolute bottom-[-4px] left-2/4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
                   <div className="absolute bottom-[-4px] left-3/4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group relative rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-10 h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                    <Volume2 className="text-purple-400" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Voice Operating System</h3>
                  <p className="text-slate-400 leading-relaxed">No typing required. Just talk to the app like a human. Multi-language latency-free processing via Vapi.</p>
                </div>
                
                {/* Pulse Visual */}
                <div className="mt-12 flex justify-center items-center h-20 gap-2">
                  {[1,2,3,4,5].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: ["20%", "100%", "20%"] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      className="w-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group relative rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#0f172a] opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="p-10 h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center mb-6">
                    <WifiOff className="text-slate-300" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Edge Robustness</h3>
                  <p className="text-slate-400 leading-relaxed">Engineered for real-world connectivity. Automatic local caching and sync queues ensure data integrity.</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-2 group relative rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-l from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-10 h-full flex flex-col md:flex-row justify-between relative z-10 gap-8">
                <div className="max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <ShieldAlert className="text-emerald-400" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Lens OCR Safety Analysis</h3>
                  <p className="text-slate-400 leading-relaxed">Tap the camera, point at a medicine strip. GPT-4o Vision processes the text, cross-references with the schedule, and audits for safety.</p>
                </div>
                
                {/* Scanning Visual */}
                <div className="flex-1 min-w-[200px] h-40 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] z-20"
                  />
                  <Pill size={48} className="text-slate-700" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Immersive CTA */}
      <section className="py-40 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             viewport={{ once: true }}
             transition={{ type: "spring" }}
             className="w-24 h-24 mx-auto bg-white rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          >
            <Activity className="text-blue-600" size={40} strokeWidth={3} />
          </motion.div>
          
          <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 drp-shadow-lg">
            Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Next-Gen</span> Health?
          </h2>
          <p className="text-2xl font-medium text-slate-400 mb-12 max-w-2xl mx-auto">Skip the complexity. Talk to your digital health memory today.</p>
          
          <Link href="/login" className="group relative inline-flex items-center gap-3 bg-white text-slate-950 px-12 py-6 rounded-full text-2xl font-black transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
            <span>Enter Studio</span>
            <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-transparent border-t border-white/5 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <Activity className="text-white" size={20} />
            <span className="text-xl font-black tracking-tight text-white">WellSync</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-500">
             <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
             <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-sm font-bold text-slate-600">
            © {new Date().getFullYear()} WellSync AI Studio.
          </p>
        </div>
      </footer>
      
      {/* Global generic animations for scanline overlay */}
      <style dangerouslySetInnerHTML={{__html: `
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}} />
    </div>
  );
}
