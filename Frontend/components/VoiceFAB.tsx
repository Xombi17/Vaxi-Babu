'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useGeminiVoiceBridge } from '@/lib/gemini-voice';

export function VoiceFAB() {
  const params = useParams();
  const dependentId = params && typeof params === 'object' && 'dependent_id' in params
    ? (params.dependent_id as string)
    : '';

  const { isConnected, isConnecting, connect, disconnect, error } = useGeminiVoiceBridge();

  const [callError, setCallError] = useState<string | null>(null);
  const startInFlightRef = useRef(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearErrorTimer = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setTransientError = useCallback(
    (msg: string, duration = 5000) => {
      setCallError(msg);
      clearErrorTimer();
      errorTimeoutRef.current = setTimeout(() => {
        setCallError(null);
      }, duration);
    },
    [clearErrorTimer]
  );

  useEffect(() => {
    if (error) {
      setTransientError(error);
    }
  }, [error, setTransientError]);

  const startCall = useCallback(async () => {
    if (startInFlightRef.current || isConnecting || isConnected) return;

    startInFlightRef.current = true;

    try {
      if (typeof window === 'undefined') {
        setTransientError('Voice is available only in the browser.');
        return;
      }

      const householdId = (localStorage.getItem('household_id') || '').trim();
      if (!householdId) {
        setTransientError('Select a household first.');
        return;
      }

      await connect('English', householdId, dependentId);
    } catch (error: any) {
      console.error('Failed to start voice call:', error);
      setTransientError(error?.message || 'Failed to start voice call');
    } finally {
      startInFlightRef.current = false;
    }
  }, [isConnecting, isConnected, connect, dependentId, setTransientError]);

  const stopCall = useCallback(async () => {
    startInFlightRef.current = false;
    try {
      await disconnect();
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  }, [disconnect]);

  const toggleCall = useCallback(async () => {
    if (isConnecting && !isConnected) return;
    if (isConnected) {
      await stopCall();
    } else {
      await startCall();
    }
  }, [isConnected, isConnecting, startCall, stopCall]);

  const fabPositionClass = 'bottom-32 md:bottom-12 right-6 md:right-12';
  const panelPositionClass = 'bottom-56 md:bottom-40 right-6 md:right-12';
  const errorPositionClass = 'bottom-52 md:bottom-36 right-6 md:right-12';

  return (
    <>
      <AnimatePresence mode="wait">
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${panelPositionClass} z-50 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-[20px_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_40px_rgba(0,0,0,0.5)] border border-blue-100 dark:border-slate-700 flex items-center gap-6`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Volume2 className="text-blue-500" size={24} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-blue-400/20 rounded-2xl -z-10"
              />
            </div>
            <div className="pr-2">
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1">
                Health Assistant
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.15em]">
                  Listening Now
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {callError && !isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed ${errorPositionClass} z-40 max-w-xs rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 shadow-md`}
          >
            {callError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleCall}
        animate={{
          boxShadow: isConnected
            ? '0px 0px 40px rgba(244, 63, 94, 0.4)'
            : '10px 10px 20px rgba(59, 130, 246, 0.2)',
        }}
        disabled={isConnecting}
        className={`fixed ${fabPositionClass} w-16 h-16 md:w-20 md:h-20 rounded-[2.5rem] flex items-center justify-center z-50 transition-all duration-300 shadow-[inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.05)] ${
          isConnected
            ? 'bg-rose-500 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin" strokeWidth={3} />
        ) : isConnected ? (
          <Square className="w-8 h-8 md:w-10 md:h-10 fill-white" strokeWidth={3} />
        ) : (
          <Mic className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
        )}
      </motion.button>
    </>
  );
}
