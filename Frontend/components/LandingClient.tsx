'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { Activity, ShieldCheck, HeartPulse, Clock, BrainCircuit, Globe2, Star, Download, Play, Smartphone } from 'lucide-react';

export default function LandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Horizontal Scroll refs for the sticky walkthrough feature
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalRef,
  });
  
  // Maps 0-1 vertical scroll to 0% to -66% horizontal translation (since we have 3 panels of mostly 100vw but squeezed tightly)
  const xTransform = useTransform(horizontalProgress, [0, 1], ["0%", "-66.6666%"]);

  return (
    <div className="relative z-10 w-full bg-slate-950 text-slate-50 selection:bg-primary selection:text-white" ref={containerRef}>
      
      {/* 1. HERO ALIVE - Cinematic Hook */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-28 pb-10 px-6 overflow-hidden">
        {/* Animated Background Ambience - Stitch Tonal Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute top-1/4 -left-[20%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] rounded-full bg-primary/20 blur-[100px] md:blur-[140px] mix-blend-screen"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 -right-[10%] w-[50vw] md:w-[35vw] h-[50vw] md:h-[35vw] rounded-full bg-[#84d4d3]/20 blur-[80px] md:blur-[120px] mix-blend-screen"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/30 bg-slate-900/40 text-primary-light font-bold text-sm mb-10 backdrop-blur-xl"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#84d4d3] animate-pulse shadow-[0_0_12px_#84d4d3]" />
            #1 Offline PWA for Rural Care
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[7rem] font-lora font-black tracking-tighter leading-[1.05] mb-8"
          >
            The digital sanctuary <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#84d4d3,#006a6a)]">for family health.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mb-14 leading-relaxed"
          >
            No typing, no complex menus. Talk to a digital health assistant that instantly organizes health records securely in 6 local languages.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Link href="/login" className="group relative overflow-hidden rounded-[2.5rem] p-[2px]">
               <div className="absolute inset-0 bg-[linear-gradient(135deg,#005050,#006a6a)] group-hover:bg-[linear-gradient(135deg,#006a6a,#84d4d3)] transition-colors duration-500" />
               <div className="relative bg-slate-950/40 backdrop-blur-xl px-12 py-5 rounded-[2.5rem] flex items-center justify-center gap-3 text-white text-xl font-bold">
                  <Download className="w-6 h-6 text-[#84d4d3]" />
                  Install App
               </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. HORIZONTAL SCROLL JOURNEY (Sticky Narrative) */}
      {/* We use a height of 300vh so it takes 3 screens of vertical scroll to unlock the sticky container */}
      <section ref={horizontalRef} className="relative h-[300vh] bg-slate-950 border-t border-slate-900/50">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          {/* Scroll instruction indicator that fades out as we start scrolling */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center gap-2"
            style={{ opacity: useTransform(horizontalProgress, [0, 0.1], [1, 0]) }}
          >
            <span className="text-sm tracking-widest uppercase font-bold">Hold & Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent" />
          </motion.div>

          <motion.div style={{ x: xTransform }} className="flex gap-16 px-[10vw]">
            
            {/* Panel 1 */}
            <div className="w-[85vw] md:w-[65vw] lg:w-[50vw] shrink-0 flex flex-col justify-center">
              <div className="bg-slate-900/30 backdrop-blur-3xl border border-slate-800/80 p-12 md:p-16 rounded-[4rem] group hover:border-[#84d4d3]/30 transition-colors duration-500">
                <Globe2 className="w-20 h-20 text-[#84d4d3] mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h2 className="text-5xl md:text-6xl font-lora font-bold mb-8 text-white">6 Local Languages.</h2>
                <p className="text-2xl md:text-3xl text-slate-400 leading-relaxed font-medium">Speak naturally in English, Hindi, Marathi, Bengali, Tamil, and Telugu. Voted the most accessible voice UI.</p>
              </div>
            </div>

            {/* Panel 2 */}
            <div className="w-[85vw] md:w-[65vw] lg:w-[50vw] shrink-0 flex flex-col justify-center">
              <div className="bg-slate-900/30 backdrop-blur-3xl border border-slate-800/80 p-12 md:p-16 rounded-[4rem] group hover:border-[#84d4d3]/30 transition-colors duration-500">
                <ShieldCheck className="w-20 h-20 text-[#84d4d3] mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h2 className="text-5xl md:text-6xl font-lora font-bold mb-8 text-white">Medicine Safety.</h2>
                <p className="text-2xl md:text-3xl text-slate-400 leading-relaxed font-medium">Scan medicine strips securely. We cross-reference with schedules to prevent errors instantly.</p>
              </div>
            </div>

            {/* Panel 3 */}
            <div className="w-[85vw] md:w-[65vw] lg:w-[50vw] shrink-0 flex flex-col justify-center">
              <div className="bg-slate-900/30 backdrop-blur-3xl border border-slate-800/80 p-12 md:p-16 rounded-[4rem] group hover:border-[#84d4d3]/30 transition-colors duration-500">
                <Clock className="w-20 h-20 text-[#84d4d3] mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h2 className="text-5xl md:text-6xl font-lora font-bold mb-8 text-white">Predictive Timelines.</h2>
                <p className="text-2xl md:text-3xl text-slate-400 leading-relaxed font-medium">The Indian NIS scheduler determines exactly when your children need their vaccines automatically.</p>
              </div>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* 3. ASYMMETRICAL STORY (Tonal Layering - Scroll trigger) */}
      {/* Light aesthetic to bridge to accessibility / offline reliability */}
      <section className="py-40 bg-slate-50 text-slate-900 border-t-[30px] border-primary pb-52 border-b-2 border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 150 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col lg:flex-row gap-20 items-center"
          >
            <div className="flex-1 space-y-10 lg:pr-10">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-lora font-black tracking-tight text-slate-900 leading-tight">
                Built to work <br /> <span className="text-primary italic">offline.</span>
              </h2>
              <p className="text-2xl md:text-3xl text-slate-600 font-medium leading-relaxed">
                Log events without the internet. Next time you reach a cell tower, we&rsquo;ll securely sync it back to the cloud. Designed specifically for rural connectivity hurdles.
              </p>
            </div>
            
            {/* The Floating UI Diagram */}
            <div className="flex-1 w-full bg-white rounded-[4rem] p-12 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,106,106,0.15)] relative">
               <div className="absolute top-0 right-0 w-80 h-80 bg-[#84d4d3]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
               <Smartphone className="w-16 h-16 text-primary mb-10" />
               <div className="space-y-6 relative z-10">
                 {[1,2,3].map(i => (
                    <motion.div 
                      key={i} 
                      className="h-24 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-100 flex items-center px-8 gap-6 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true, margin: "-50px" }}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100/50">
                        <Activity size={24} />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="h-4 w-1/3 bg-slate-200 rounded-full" />
                        <div className="h-3 w-1/4 bg-slate-100 rounded-full" />
                      </div>
                    </motion.div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* 4. CLIMAX CTA */}
      <section className="relative py-52 bg-slate-950 overflow-hidden text-center flex flex-col items-center">
        {/* Deep gradient pulse for climax */}
        <motion.div 
          className="absolute inset-0 opacity-50 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: false }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] bg-[radial-gradient(circle,rgba(0,106,106,0.4)_0%,transparent_70%)] blur-2xl" />
        </motion.div>
        
        <div className="relative z-10 max-w-5xl px-6">
           <motion.h2 
             initial={{ scale: 0.9, opacity: 0, y: 50 }}
             whileInView={{ scale: 1, opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="text-6xl md:text-8xl lg:text-[7rem] font-lora font-black text-white mb-12 tracking-tight leading-[1.1]"
           >
             Ready to remember?
           </motion.h2>
           
           <motion.div
             initial={{ y: 50, opacity: 0 }}
             whileInView={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           >
             <Link href="/login" className="inline-flex bg-white text-slate-950 px-16 py-6 rounded-[3rem] text-2xl font-bold shadow-2xl hover:scale-105 hover:bg-[#84d4d3] hover:shadow-[#006a6a]/30 transition-all duration-300">
                Install WellSync Now
             </Link>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.6 }}
             className="mt-14 flex items-center justify-center gap-3 text-lg font-bold text-slate-400"
           >
             <div className="flex text-[#84d4d3] gap-1">
               <Star size={20} fill="currentColor" />
               <Star size={20} fill="currentColor" />
               <Star size={20} fill="currentColor" />
               <Star size={20} fill="currentColor" />
               <Star size={20} fill="currentColor" />
             </div>
             <span>Trusted by 10,000+ families</span>
           </motion.div>
        </div>
      </section>
      
    </div>
  );
}
