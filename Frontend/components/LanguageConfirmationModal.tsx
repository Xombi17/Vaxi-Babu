'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X as XIcon, Check, Globe } from 'lucide-react';

interface LanguageConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  languageName: string;
}

export function LanguageConfirmationModal({ isOpen, onClose, onConfirm, languageName }: LanguageConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-700/50"
          >
            <div className="h-32 bg-blue-500 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-90" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_50%,#fff,transparent)]" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                className="relative z-10 w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Globe className="text-blue-500" size={40} strokeWidth={2.5} />
              </motion.div>
            </div>

            <div className="p-8 pb-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                  Switch to {languageName}?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Your voice assistant will switch to {languageName} for a more personalized experience.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={20} strokeWidth={3} />
                  Switch Language
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <XIcon size={20} strokeWidth={3} />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}