import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function MedicineSafetyFeature() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 font-raleway selection:bg-[#004040] selection:text-white">
      <div className="p-8">
         <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors uppercase tracking-widest text-xs font-bold">
            <ArrowLeft size={16} /> The Digital Sanctuary
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-12 border-t-[8px] border-[#004040]">
         {/* Left Visual Column (Flipped composition for rhythm) */}
         <div className="p-8 md:p-16 lg:p-24 bg-white flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="w-full max-w-lg bg-slate-100 p-8 border border-slate-300 relative">
               <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 flex items-center justify-center translate-x-1/2 -translate-y-1/2 border border-red-200">
                  <ShieldAlert className="text-red-600" />
               </div>
               <h3 className="font-lora text-2xl font-bold mb-4">Paracetamol 500mg</h3>
               <p className="text-slate-500 font-mono text-sm mb-6">OCR MATCH: EXPECTED 200MG</p>
               <div className="bg-red-50 text-red-800 p-4 border-l-4 border-red-500 text-sm font-bold">
                  Danger: Dose exceeds pediatric limits for age 3.
               </div>
            </div>
         </div>

         {/* Right Text Column */}
         <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
            <span className="text-slate-400 font-bold tracking-widest uppercase text-sm mb-6">Vol. 01 / Feature 02</span>
            <h1 className="font-lora text-6xl md:text-8xl leading-[1.0] text-[#004040] tracking-tighter mb-12">
               Medicine <br/> <span className="italic text-slate-400">Safety.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium mb-12 max-w-xl">
               Optical Character Recognition via AI acts as a secondary guardian. Scan a medicine strip, and the system instantly cross-references the dosage with the child&apos;s recorded age and weight.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8">
               <div>
                  <span className="block text-4xl font-lora font-black text-[#004040] mb-2">0.2s</span>
                  <span className="uppercase tracking-widest text-xs font-bold text-slate-400">Verification Time</span>
               </div>
               <div>
                  <span className="block text-4xl font-lora font-black text-[#004040] mb-2">99%</span>
                  <span className="uppercase tracking-widest text-xs font-bold text-slate-400">OCR Accuracy</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
