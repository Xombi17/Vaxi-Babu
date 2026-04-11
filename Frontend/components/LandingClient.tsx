'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { 
  Activity, Mic, ShieldCheck, HeartPulse, Clock, 
  BrainCircuit, Globe2, Fingerprint, Lock, Zap, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function LandingClient() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative z-10 font-sans antialiased text-white">
      
      {/* 1. HERO SECTION */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100svh] flex flex-col justify-center items-center text-center px-6 pt-20"
      >
        {/* Futuristic glowing orbs in the background (CSS-only for zero lag) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Vapi Voice Engine 2.0 Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8">
            Health tracking,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              spoken into reality.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto mb-12">
            No typing. No complex menus. Just talk to your digital health assistant. 
            WellSync organizes your family&apos;s medical timeline instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="group relative w-full sm:w-auto overflow-hidden bg-white text-slate-950 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <span className="relative z-10">Start for free</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* 2. THE PROBLEM / SOLUTION (SCROLL TRIGGERED) */}
      <section className="py-32 relative bg-[#020617] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
              The interface of the future is <span className="text-indigo-400">invisible.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Traditional health apps force you to navigate endless forms. We replaced the entire UI with a conversational AI that understands you in 6 local languages.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: "Just Speak", desc: "Native Voice OS powered by Vapi. Sub-second latency. Feels like talking to a human." },
              { icon: Globe2, title: "Multi-Lingual", desc: "Fluent in English, Hindi, Marathi, Bengali, Tamil, and Telugu. Reaches the unreached." },
              { icon: BrainCircuit, title: "Smart Memory", desc: "Remembers your children&apos;s names, upcoming immunizations, and past health events organically." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                  <feature.icon className="text-indigo-400" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES */}
      <section id="features" className="py-32 relative overflow-hidden text-slate-100">
        <div className="absolute inset-0 bg-blue-900/5" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl font-black tracking-tighter mb-4">Architecture of Care</h2>
            <p className="text-xl text-slate-400">A robust ecosystem designed to save lives.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gradient-to-br from-slate-900 to-[#020617] border border-white/10 rounded-[32px] p-10 flex flex-col justify-between overflow-hidden relative group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] group-hover:bg-emerald-500/20 transition-colors duration-500 rounded-full" />
              <div className="relative z-10">
                <ShieldCheck className="text-emerald-400 mb-6" size={40} />
                <h3 className="text-3xl font-black mb-4">AI Lens Security</h3>
                <p className="text-slate-400 text-lg max-w-md">Point your camera at a medicine strip. Our OCR pipeline cross-references it with your schedule to prevent multi-drug clinical errors instantly.</p>
              </div>
            </motion.div>

            {/* Small Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/40 border border-white/10 rounded-[32px] p-10 flex flex-col justify-between"
            >
              <Clock className="text-blue-400 mb-6" size={40} />
              <div>
                <h3 className="text-2xl font-bold mb-2">Predictive Timeline</h3>
                <p className="text-slate-400">Automated Indian NIS scheduler engine computes exact due dates.</p>
              </div>
            </motion.div>

            {/* Small Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-slate-900/40 border border-white/10 rounded-[32px] p-10 flex flex-col justify-between"
            >
              <Zap className="text-amber-400 mb-6" size={40} />
              <div>
                <h3 className="text-2xl font-bold mb-2">Edge Sync</h3>
                <p className="text-slate-400">Offline-capable data queues ensure you never lose a log in low-network areas.</p>
              </div>
            </motion.div>

            {/* Large Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-gradient-to-tr from-indigo-900/20 to-[#020617] border border-white/10 rounded-[32px] p-10 flex flex-col justify-between overflow-hidden relative group"
            >
              <div className="relative z-10">
                <HeartPulse className="text-rose-400 mb-6" size={40} />
                <h3 className="text-3xl font-black mb-4">Holistic Analytics</h3>
                <p className="text-slate-400 text-lg max-w-md">Gain macro-level insights into your family&apos;s health patterns. Visual dashboards track everything from growth curves to vaccination density.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY AND TRUST */}
      <section className="py-40 bg-[#020617] relative border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Fingerprint className="text-slate-600 w-24 h-24 mx-auto mb-10" />
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-8"
          >
            Bank-grade encryption for <br/> your family&apos;s data.
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 gap-6 text-left mt-16">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <Lock className="text-blue-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-xl mb-2">SOC2 Ready Backend</h4>
                <p className="text-slate-400">Powered by FastAPI and Neon Postgres with full async, TLS encrypted transit, and role-based access.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <CheckCircle2 className="text-blue-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-xl mb-2">Deterministic Engine</h4>
                <p className="text-slate-400">We never use LLMs to calculate medical schedules. Core health logic is perfectly deterministic and fully test-driven.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: TESTIMONIALS SECTION */}
      <section className="py-32 bg-slate-900/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tighter">Trusted by Caregivers</h2>
            <p className="text-slate-400">Join 10,000+ families managing health with WellSync AI.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Priya S.", role: "Mother of 2", text: "WellSync changed how I manage Saanvi&apos;s vaccinations. The voice assistant is shockingly helpful when I have my hands full." },
              { name: "Advait K.", role: "Health Worker", text: "The medicine scanning feature is a game changer for remote care. It prevents dangerous medicine mixups in seconds." },
              { name: "Rohan M.", role: "Software Engineer", text: "Finally, a health app that doesn&apos;t feel like a 1990s database. The UI is gorgeous and the voice latency is incredible." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-slate-800/30 border border-white/5 backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Zap key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-lg text-slate-300 mb-6 italic">&quot;{t.text}&quot;</p>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: FAQ SECTION (INTERACTIVE ACCORDION-STYLE) */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-16 tracking-tighter text-center">Frequently Asked</h2>
          <div className="space-y-4">
            {[
              { q: "Is WellSync a medical advice service?", a: "No. WellSync is a health tracking and intelligence platform. We provide deterministic scheduling and AI-assisted data entry, but you should always consult a licensed medical professional." },
              { q: "How secure is my family&apos;s data?", a: "We use AES-256 at rest and TLS 1.3 in transit. Your data is stored in isolated Neon Postgres instances with strict encryption protocols." },
              { q: "Does it work without internet?", a: "Yes. Our mobile-first design includes an offline synchronization engine that queues your voice logs and scans, pushing them to the cloud once you regain connectivity." },
              { q: "Which languages are supported?", a: "We currently support high-fidelity voice interactions in English, Hindi, Marathi, Bengali, Tamil, and Telugu." }
            ].map((item, i) => (
              <motion.details 
                key={i}
                className="group p-6 rounded-3xl bg-white/5 border border-white/10 cursor-pointer overflow-hidden transition-all hover:bg-white/10"
              >
                <summary className="list-none flex justify-between items-center font-bold text-xl">
                  {item.q}
                  <ArrowRight size={20} className="group-open:rotate-90 transition-transform text-indigo-400" />
                </summary>
                <div className="mt-4 text-slate-400 leading-relaxed text-lg">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BIG CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-indigo-900/20" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 glow-text">
            Experience WellSync.
          </h2>
          <Link href="/login" className="inline-flex items-center gap-3 bg-white text-slate-950 px-12 py-5 rounded-full text-xl font-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Start the Demo
            <ArrowRight size={24} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
