'use client';
import { useState, useRef } from 'react';
import { X as XIcon, AlertTriangle, Volume2, ScanLine, Type, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkMedicineByImage, checkMedicineByName, MedicineSafetyResponse } from '../lib/api';

export function ScannerView() {
  const [showResult, setShowResult] = useState(false);
  const [mode, setMode] = useState<'camera' | 'text'>('camera');
  const [medicineName, setMedicineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineSafetyResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextCheck = async () => {
    if (!medicineName) return;
    setLoading(true);
    const lang = localStorage.getItem('primary_language') || 'en';
    try {
      const data = await checkMedicineByName(medicineName, undefined, lang);
      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error('Safety check failed:', error);
      alert('Failed to check medicine safety. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const lang = localStorage.getItem('primary_language') || 'en';
    try {
      const data = await checkMedicineByImage(file, undefined, lang);
      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error('OCR/Safety check failed:', error);
      alert('Failed to analyze image. Ensure text is clear and try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakResult = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    
    const lang = localStorage.getItem('primary_language') || 'en';
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Select correct regional voice
    let voice;
    if (lang === 'hi') {
      voice = voices.find(v => v.lang.startsWith('hi'));
    } else if (lang === 'mr') {
      voice = voices.find(v => v.lang.startsWith('mr'));
    } else if (lang === 'gu') {
      voice = voices.find(v => v.lang.startsWith('gu'));
    } else if (lang === 'bn') {
      voice = voices.find(v => v.lang.startsWith('bn'));
    } else if (lang === 'ta') {
      voice = voices.find(v => v.lang.startsWith('ta'));
    } else if (lang === 'te') {
      voice = voices.find(v => v.lang.startsWith('te'));
    } else {
      voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
              voices.find(v => v.lang.startsWith('en'));
    }

    if (voice) utterance.voice = voice;
    utterance.lang = lang === 'hi' ? 'hi-IN' : 
                     lang === 'mr' ? 'mr-IN' : 
                     lang === 'gu' ? 'gu-IN' :
                     lang === 'bn' ? 'bn-IN' :
                     lang === 'ta' ? 'ta-IN' : 
                     lang === 'te' ? 'te-IN' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-[#f3f6fd] dark:bg-slate-900 rounded-[3rem] overflow-hidden relative flex flex-col shadow-[15px_15px_30px_rgba(0,0,0,0.05),-15px_-15px_30px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[15px_15px_30px_rgba(0,0,0,0.5),-15px_-15px_30px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)]">
      
      {/* Hidden File Input for Camera/Gallery */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
      />

      {/* Top Bar */}
      <div className="pt-8 px-8 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-[4px_4px_10px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.5)]">
            <ScanLine className="text-blue-500 dark:text-blue-400" size={24} strokeWidth={3} />
          </div>
          <h2 className="text-slate-800 dark:text-white font-black text-xl">Medicine Checker</h2>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-8 mt-6 z-20 relative">
        <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]">
          <button 
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${mode === 'camera' ? 'bg-blue-400 dark:bg-blue-500 text-white shadow-[4px_4px_8px_rgba(96,165,250,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            <Camera size={18} strokeWidth={3} /> Scan Image
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${mode === 'text' ? 'bg-blue-400 dark:bg-blue-500 text-white shadow-[4px_4px_8px_rgba(96,165,250,0.3),inset_2px_2px_4px_rgba(255,255,255,0.5),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            <Type size={18} strokeWidth={3} /> Enter Name
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-20 relative">
          <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin mb-6" />
          <p className="text-xl font-black text-slate-800 dark:text-white">Analyzing Medicine...</p>
          <p className="text-slate-400 font-bold mt-2 text-center">Checking for safety conflicts and dosage guidelines</p>
        </div>
      ) : mode === 'camera' ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pt-32">
            <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-sm"></div>
            
            <div className="w-72 h-40 border-4 border-white/80 dark:border-slate-700/80 rounded-[2rem] relative shadow-[0_0_30px_rgba(255,255,255,0.5)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 dark:border-blue-500 rounded-tl-[2rem]" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 dark:border-blue-500 rounded-tr-[2rem]" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 dark:border-blue-500 rounded-bl-[2rem]" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 dark:border-blue-500 rounded-br-[2rem]" />

              <motion.div
                animate={{ y: [0, 150, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 right-0 h-1 bg-blue-400 dark:bg-blue-500 shadow-[0_0_15px_3px_rgba(96,165,250,0.8)] dark:shadow-[0_0_15px_3px_rgba(59,130,246,0.8)] rounded-full"
              />

              <p className="absolute -bottom-16 left-0 right-0 text-center text-slate-700 dark:text-slate-300 font-bold text-sm bg-white/90 dark:bg-slate-800/90 py-2 px-5 rounded-2xl w-max mx-auto backdrop-blur-md shadow-[4px_4px_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)]">
                Align medicine strip here
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="pb-12 flex flex-col items-center gap-4 z-20">
            <button
              onClick={triggerCamera}
              className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-all shadow-[10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] group"
            >
              <div className="w-20 h-20 rounded-full bg-blue-400 dark:bg-blue-500 group-hover:bg-blue-600 transition-colors flex items-center justify-center shadow-[inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]">
                <Camera className="text-white" size={40} strokeWidth={3} />
              </div>
            </button>
            <p className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm">
              Capture or Upload
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center px-8 z-20 relative">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)]">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 text-center">Enter Medicine Name</h3>
            <input 
              type="text" 
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextCheck()}
              placeholder="e.g. Paracetamol 500mg" 
              className="w-full bg-[#f3f6fd] dark:bg-slate-900 rounded-2xl px-6 py-5 text-slate-800 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all text-center text-lg mb-8"
            />
            <button 
              onClick={handleTextCheck}
              disabled={!medicineName || loading}
              className="w-full bg-blue-400 dark:bg-blue-500 text-white rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Check Safety'}
            </button>
          </div>
        </div>
      )}

      {/* Result Modal - Fixed to be above everything including header/sidebar */}
      <AnimatePresence>
        {showResult && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResult(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t-8 border-blue-400 dark:border-blue-500 overflow-hidden"
            >
              <button 
                onClick={() => setShowResult(false)}
                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-inner"
              >
                <XIcon size={24} strokeWidth={3} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl relative ${
                  result.bucket === 'consult_doctor_urgently' 
                  ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-900/40' 
                  : result.bucket === 'use_with_caution'
                  ? 'bg-amber-400 text-white shadow-amber-200 dark:shadow-amber-900/40'
                  : 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900/40'
                }`}>
                  <div className="absolute inset-0 rounded-[2rem] animate-pulse opacity-50 bg-inherit filter blur-xl"></div>
                  {result.bucket === 'common_use' ? <CheckCircle2 size={56} strokeWidth={3} className="relative z-10" /> : <AlertTriangle size={56} strokeWidth={3} className="relative z-10" />}
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 truncate w-full px-4 tracking-tight">
                  {result.detected_medicine}
                </h3>
                <p className={`text-base font-black uppercase tracking-[0.2em] mb-8 ${
                  result.bucket === 'consult_doctor_urgently' ? 'text-rose-500' :
                  result.bucket === 'use_with_caution' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {result.bucket.replace(/_/g, ' ')}
                </p>

                <div className="bg-[#f3f6fd] dark:bg-slate-800/50 w-full p-8 rounded-[2.5rem] shadow-inner mb-10 text-left border border-white dark:border-slate-800 transition-colors">
                  <p className="text-slate-700 dark:text-slate-300 font-bold text-xl mb-6 leading-tight">
                    {result.why_caution}
                  </p>
                  <div className="flex items-start gap-4 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-l-[6px] border-blue-400 shadow-sm">
                    <div className="bg-blue-400 p-1 rounded-lg text-white font-black text-[10px] uppercase mt-1 shrink-0">NEXT</div>
                    <p className="text-blue-800 dark:text-blue-200 text-lg font-black leading-tight">
                      {result.next_step}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-4">
                  <button 
                    onClick={() => speakResult(`${result.detected_medicine}. ${result.why_caution}. Next step: ${result.next_step}. ${result.disclaimer}`)}
                    className="w-full bg-blue-400 dark:bg-blue-500 text-white rounded-[2rem] py-6 font-black text-xl flex items-center justify-center gap-4 transition-all shadow-[6px_6px_12px_rgba(96,165,250,0.3),inset_2px_2px_6px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-inner"
                  >
                    <Volume2 size={32} strokeWidth={3} />
                    Listen to Guide
                  </button>

                  <button
                    onClick={() => {
                      setShowResult(false);
                      setMedicineName('');
                      setResult(null);
                    }}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black py-4 transition-colors"
                  >
                    Check Another
                  </button>
                </div>
                
                <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold max-w-md mx-auto">
                  {result.disclaimer}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
