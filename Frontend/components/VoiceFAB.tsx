'use client';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// Vapi Public Key and Assistant ID should be in .env
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

import { useParams } from 'next/navigation';

interface VapiInstance {
  start: (assistantId: string, assistantOverrides?: any) => Promise<any>;
  stop: () => void;
  on: (event: any, callback: (...args: any[]) => void) => any;
}

export function VoiceFAB() {
  const params = useParams();
  const dependentId = params?.dependent_id as string;
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [vapi, setVapi] = useState<VapiInstance | null>(null);

  // Dynamic import of Vapi SDK to avoid SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initVapi = async () => {
        try {
          const VapiModule = await import('@vapi-ai/web');
          const VapiConstructor = VapiModule.default || VapiModule;
          // @ts-ignore - Vapi constructor types can be tricky with ESM/CJS interop
          const vapiInstance = new VapiConstructor(VAPI_PUBLIC_KEY);
          setVapi(vapiInstance);

          vapiInstance.on('call-start', () => {
            setIsConnecting(false);
            setIsActive(true);
          });

          vapiInstance.on('call-end', () => {
            setIsConnecting(false);
            setIsActive(false);
          });

          vapiInstance.on('error', (e: any) => {
            console.error('Vapi Error:', e);
            setIsConnecting(false);
            setIsActive(false);
          });
        } catch (err) {
          console.warn('Vapi SDK could not be initialized. Voice features will be simulated.');
        }
      };
      initVapi();
    }
  }, []);

  const toggleCall = useCallback(async () => {
    if (isActive) {
      vapi?.stop();
      setIsActive(false);
    } else {
      setIsConnecting(true);

      // Simulation mode if keys are missing
      if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID || !vapi) {
        console.info('Using Voice Simulation Mode (API Keys missing or SDK loading)');
        setTimeout(() => {
          setIsConnecting(false);
          setIsActive(true);
        }, 1200);
        return;
      }

      try {
        const householdId = localStorage.getItem('household_id') || '';
        const language = localStorage.getItem('primary_language') || 'en';
        
        const firstMessages: Record<string, string> = {
          en: "Hello! I'm your WellSync health assistant. How can I help you today?",
          hi: "नमस्ते! मैं आपका वेलसिंक स्वास्थ्य सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
          mr: "नमस्कार! मी तुमचा वेलसिंक आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
          gu: "નમસ્તે! હું તમારો વેલસિંક સ્વાસ્થ્ય સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
          bn: "হ্যালো! আমি আপনার ওয়েলসিঙ্ক স্বাস্থ্য সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
          ta: "வணக்கம்! நான் உங்கள் வெல்சின்க் சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
          te: "నమస్తే! నేను మీ వెల్సింక్ ఆరోగ్య సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
        };

        const targetLangName: Record<string, string> = {
          hi: "Hindi", mr: "Marathi", gu: "Gujarati", bn: "Bengali", ta: "Tamil", te: "Telugu", en: "English"
        };
        const langName = targetLangName[language] || "English";
        const greeting = firstMessages[language] || firstMessages.en;

        console.log('VoiceFAB: Starting Vapi call', { 
          language, 
          householdId, 
          dependentId, 
          assistantId: VAPI_ASSISTANT_ID 
        });

        await vapi.start(VAPI_ASSISTANT_ID, {
          firstMessage: greeting,
          transcriber: {
            provider: 'deepgram',
            language: language === 'en' ? 'en-US' : language,
          },
          variableValues: {
            household_id: householdId,
            dependent_id: dependentId || '',
            language: language,
            language_name: langName,
            first_message: greeting,
          }
        });
      } catch (err) {
        console.error('Failed to start Vapi call:', err);
        setIsConnecting(false);
        setIsActive(false);
      }
    }
  }, [isActive, vapi, dependentId]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-32 right-8 z-50 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-[20px_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_40px_rgba(0,0,0,0.5)] border border-blue-100 dark:border-slate-700 flex items-center gap-6"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Volume2 className="text-blue-500" size={24} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-400/20 rounded-2xl -z-10"
              />
            </div>
            <div className="pr-2">
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1">Health Assistant</p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.15em]">Listening Now</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleCall}
        animate={{
          boxShadow: isActive 
            ? "0px 0px 40px rgba(244, 63, 94, 0.4)"
            : "10px 10px 20px rgba(59, 130, 246, 0.2)",
        }}
        disabled={isConnecting}
        className={`fixed bottom-8 right-8 w-16 h-16 md:w-20 md:h-20 rounded-[2.5rem] flex items-center justify-center z-50 transition-all duration-300 shadow-[inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.05)] ${
          isActive 
          ? 'bg-rose-500 text-white' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin" strokeWidth={3} />
        ) : isActive ? (
          <Square className="w-8 h-8 md:w-10 md:h-10 fill-white" strokeWidth={3} />
        ) : (
          <Mic className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
        )}
      </motion.button>
    </>
  );
}
