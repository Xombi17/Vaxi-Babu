import Link from 'next/link';
import { ArrowLeft, Baseline } from 'lucide-react';

export default function PredictiveSchedulerFeature() {
  return (
    <div className="min-h-screen bg-[#004040] text-white font-raleway selection:bg-white selection:text-[#004040]">
      <div className="p-8">
         <Link href="/" className="inline-flex items-center gap-2 text-[#84d4d3] hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">
            <ArrowLeft size={16} /> The Digital Sanctuary
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-12 border-t border-[#006a6a]">
         {/* Left text column */}
         <div className="p-8 md:p-16 lg:p-24 lg:border-r border-[#006a6a] flex flex-col justify-center">
            <span className="text-[#84d4d3] font-bold tracking-widest uppercase text-sm mb-6">Vol. 01 / Feature 03</span>
            <h1 className="font-lora text-6xl md:text-8xl leading-[1.0] text-white tracking-tighter mb-12">
               Predictive <br/> <span className="italic text-[#84d4d3]">Scheduler.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-medium mb-12 max-w-xl">
               Integrated directly with the Indian National Immunization Schedule (NIS). Enter a born date, and the timeline formulates itself.
            </p>
            <div className="flex flex-col gap-6 w-full max-w-md">
               <div className="flex justify-between items-center py-4 border-b border-[#006a6a]">
                  <span className="font-bold">BCG (Tuberculosis)</span>
                  <span className="text-[#84d4d3]">At Birth</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-[#006a6a]">
                  <span className="font-bold">OPV-1</span>
                  <span className="text-[#84d4d3]">6 Weeks</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-[#006a6a]">
                  <span className="font-bold">Measles 1st Dose</span>
                  <span className="text-[#84d4d3]">9-12 Months</span>
               </div>
            </div>
         </div>

         {/* Right visual column */}
         <div className="p-8 md:p-16 lg:p-24 bg-slate-950 flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-4xl font-lora italic text-slate-500 mb-8 max-w-md leading-tight">
               &quot;The algorithm never forgets, so the parent doesn&apos;t have to.&quot;
            </h3>
            <p className="text-slate-400 font-bold max-w-md">
               Our deterministic architecture means schedule changes from the government can be pushed immediately across the entire user base over standard PWA updates.
            </p>
         </div>
      </div>
    </div>
  );
}
