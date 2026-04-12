import Link from 'next/link';
import { ArrowLeft, Mic } from 'lucide-react';

export default function VoiceEngineFeature() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-raleway selection:bg-[#84d4d3] selection:text-slate-950">
      <div className="p-8">
         <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">
            <ArrowLeft size={16} /> The Digital Sanctuary
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-12 border-t-[1px] border-slate-800">
         {/* Left text column */}
         <div className="p-8 md:p-16 lg:p-24 lg:border-r border-slate-800 flex flex-col justify-center">
            <span className="text-[#84d4d3] font-bold tracking-widest uppercase text-sm mb-6">Vol. 01 / Feature 01</span>
            <h1 className="font-lora text-6xl md:text-8xl leading-[1.0] text-white tracking-tighter mb-12">
               The Voice <br/> <span className="italic text-slate-500">Engine.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium mb-12 max-w-xl">
               Eliminating the digital divide by removing keyboards entirely. Powered by Gemini Live, our engine natively parses spoken health logs in English, Hindi, Marathi, Bengali, Tamil, and Telugu.
            </p>
            <div className="flex flex-col gap-6 max-w-md">
               <div className="border-l-2 border-[#84d4d3] pl-6 py-2">
                  <span className="block font-bold text-lg">Real-time Parsing</span>
                  <span className="text-slate-500">No batch processing. Immediate JSON structuring.</span>
               </div>
               <div className="border-l-2 border-[#006a6a] pl-6 py-2">
                  <span className="block font-bold text-lg">Context Aware</span>
                  <span className="text-slate-500">Remembers previous family members automatically.</span>
               </div>
            </div>
         </div>

         {/* Right visual column */}
         <div className="p-8 md:p-16 lg:p-24 bg-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,106,106,0.3)_0%,transparent_70%)]" />
            <div className="z-10 w-full max-w-lg aspect-square border border-slate-800 flex flex-col items-center justify-center p-12 text-center bg-slate-950/50 backdrop-blur-md">
               <Mic size={64} className="text-[#84d4d3] mb-8" strokeWidth={1} />
               <p className="font-lora text-3xl italic text-slate-300 mb-6">&quot;My daughter took her DPT booster today morning.&quot;</p>
               <span className="uppercase tracking-widest text-xs font-bold text-[#006a6a]">Processing Translation...</span>
            </div>
         </div>
      </div>
    </div>
  );
}
