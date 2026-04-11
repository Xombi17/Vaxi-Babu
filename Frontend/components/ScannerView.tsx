'use client';
import { useState, useRef } from 'react';
import { X, AlertTriangle, Volume2, ScanLine, Type, Camera, Loader2, CheckCircle2 } from 'lucide-react';
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
    try {
      const data = await checkMedicineByName(medicineName);
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
    try {
      const data = await checkMedicineByImage(file);
      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error('OCR/Safety check failed:', error);
      alert('Failed to analyze image. Ensure text is clear and try again.');
    } finally {
      setLoading(false);
    }
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

          <div className="pb-12 flex justify-center z-20">
            <button
              onClick={triggerCamera}
              className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-all shadow-[10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(255,255,255,0.9),inset_-4px_-4px_10px_rgba(0,0,0,0.02)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.4),-10px_-10px_20px_rgba(255,255,255,0.05),inset_4px_4px_10px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-400 dark:bg-blue-500 group-hover:scale-95 transition-transform shadow-[inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-2px_6px_rgba(0,0,0,0.1)] dark:shadow-[inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.4)]" />
            </button>
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

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-x-0 bottom-0 bg-[#f3f6fd] dark:bg-slate-900 rounded-t-[3rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-50 md:max-w-md md:mx-auto md:mb-8 md:rounded-[3rem] border-t-8 border-blue-400 dark:border-blue-500"
          >
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 md:hidden shadow-inner" />

            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl ${
                result.bucket === 'consult_doctor_urgently' 
                ? 'bg-rose-500 text-white shadow-rose-200' 
                : result.bucket === 'use_with_caution'
                ? 'bg-amber-400 text-white shadow-amber-200'
                : 'bg-emerald-500 text-white shadow-emerald-200'
              }`}>
                {result.bucket === 'common_use' ? <CheckCircle2 size={48} strokeWidth={3} /> : <AlertTriangle size={48} strokeWidth={3} />}
              </div>

              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 truncate w-full px-4">
                {result.detected_medicine}
              </h3>
              <p className={`text-sm font-black uppercase tracking-widest mb-4 ${
                result.bucket === 'consult_doctor_urgently' ? 'text-rose-500' :
                result.bucket === 'use_with_caution' ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {result.bucket.replace(/_/g, ' ')}
              </p>

              <div className="bg-white dark:bg-slate-800 w-full p-6 rounded-[2rem] shadow-inner mb-8 text-left border border-white dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-4 leading-tight">
                  {result.why_caution}
                </p>
                <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border-l-4 border-blue-400">
                  <span className="text-blue-500 font-black text-xs uppercase mt-1">NEXT:</span>
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-bold">
                    {result.next_step}
                  </p>
                </div>
              </div>

              <button className="w-full bg-blue-400 dark:bg-blue-500 text-white rounded-[1.5rem] py-5 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:translate-y-1">
                <Volume2 size={24} strokeWidth={3} />
                Listen to Guide
              </button>

              <button
                onClick={() => {
                  setShowResult(false);
                  setMedicineName('');
                  setResult(null);
                }}
                className="mt-6 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold py-3 px-6 rounded-2xl transition-colors"
              >
                Check Another
              </button>
              
              <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                {result.disclaimer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
