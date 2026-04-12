'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingClient() {
  return (
    <div className="w-full bg-white text-slate-950 font-raleway selection:bg-[#004040] selection:text-white pt-24">
      {/* HERO - Asymmetrical Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] border-b-[16px] border-[#004040]">
        
        {/* Left Side: Editorial Typography */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center p-8 md:p-16 lg:p-24 border-b lg:border-b-0 lg:border-r border-slate-200">
          <p className="tracking-widest uppercase text-xs font-bold text-slate-500 mb-8 max-w-sm border-l-2 border-slate-950 pl-4">
            Vol. 01 / The Digital Sanctuary
          </p>
          <h1 className="font-lora text-6xl md:text-8xl lg:text-[8rem] leading-[0.95] tracking-tighter text-[#004040] mb-12">
            Health <br /> Memory <br /> <span className="italic font-normal">System.</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl text-slate-600 mb-16 leading-relaxed">
            Replace chaotic paper records with a voice-native, offline-first digital infrastructure designed strictly for efficacy. Built around the Indian NIS framework.
          </p>
          
          <div className="flex gap-6 items-center">
            <Link href="/login" className="px-8 py-5 bg-[#004040] text-white text-lg font-bold hover:bg-slate-950 transition-colors inline-flex items-center gap-3">
              Commence Setup <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Right Side: Brutalist Index / Menu */}
        <div className="col-span-1 lg:col-span-5 bg-slate-50 flex flex-col pt-12">
            <div className="px-12 pb-8 border-b border-slate-200">
                <h3 className="font-bold tracking-widest uppercase text-sm mb-2">Index</h3>
                <span className="text-slate-500">Platform Features</span>
            </div>
            
            <Link href="/features/voice-engine" className="group flex flex-col px-12 py-16 border-b border-slate-200 hover:bg-white transition-colors">
               <div className="flex justify-between items-start mb-4">
                   <h2 className="font-lora text-4xl lg:text-5xl text-[#004040] group-hover:italic transition-all">Voice Engine</h2>
                   <span className="font-bold text-slate-400 font-raleway">01</span>
               </div>
               <p className="text-lg text-slate-600 max-w-md">Native language mapping to structured databases purely via speech.</p>
            </Link>

            <Link href="/features/medicine-safety" className="group flex flex-col px-12 py-16 border-b border-slate-200 hover:bg-white transition-colors">
               <div className="flex justify-between items-start mb-4">
                   <h2 className="font-lora text-4xl lg:text-5xl text-[#004040] group-hover:italic transition-all">Medicine Safety</h2>
                   <span className="font-bold text-slate-400 font-raleway">02</span>
               </div>
               <p className="text-lg text-slate-600 max-w-md">Cross-referencing against OCR-scanned prescription strips to prevent collisions.</p>
            </Link>

            <Link href="/features/predictive-scheduler" className="group flex flex-col px-12 py-16 border-b border-slate-200 hover:bg-white transition-colors">
               <div className="flex justify-between items-start mb-4">
                   <h2 className="font-lora text-4xl lg:text-5xl text-[#004040] group-hover:italic transition-all">Predict Scheduler</h2>
                   <span className="font-bold text-slate-400 font-raleway">03</span>
               </div>
               <p className="text-lg text-slate-600 max-w-md">Algorithmic timelines powered by the Indian National Immunization Schedule.</p>
            </Link>
        </div>

      </section>

      {/* RURAL FOCUS - Stark stat block */}
      <section className="py-32 px-8 md:px-16 lg:px-24 bg-[#004040] text-slate-50 border-t-[1px] border-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
                <h2 className="font-lora text-5xl md:text-7xl mb-8 leading-tight">Designed <br/>for the edge.</h2>
            </div>
            <div className="flex flex-col justify-end">
                <p className="text-2xl text-cyan-200 font-medium leading-relaxed pb-8 border-b border-slate-600/50">
                    Connectivity shouldn&apos;t dictate care. Our architecture is heavily offline-first (PWA), ensuring that updates, logs, and timelines exist locally until network layers are recovered.
                </p>
                <div className="pt-8 flex gap-12">
                   <div>
                       <span className="block text-4xl font-lora font-bold mb-2">100%</span>
                       <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Offline Logging</span>
                   </div>
                   <div>
                       <span className="block text-4xl font-lora font-bold mb-2">6</span>
                       <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Rural Dialects</span>
                   </div>
                </div>
            </div>
         </div>
      </section>
    </div>
  );
}
