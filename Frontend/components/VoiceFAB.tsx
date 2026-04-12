'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, Volume2, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';

// Vapi Public Key and Assistant ID should be in .env
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

const FIRST_MESSAGES: Record<string, string> = {
  en: "Hello! I'm your WellSync health assistant. How can I help you today?",
  hi: 'नमस्ते! मैं आपका वेलसिंक स्वास्थ्य सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?',
  mr: 'नमस्कार! मी तुमचा वेलसिंक आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?',
  gu: 'નમસ્તે! હું તમારો વેલસિંક સ્વાસ્થ્ય સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?',
  bn: 'হ্যালো! আমি আপনার ওয়েলসিঙ্ক স্বাস্থ্য সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
  ta: 'வணக்கம்! நான் உங்கள் வெல்சின்க் சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  te: 'నమస్తే! నేను మీ వెల్సింక్ ఆరోగ్య సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
};

const LANGUAGE_NAMES: Record<string, string> = {
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  en: 'English',
};

type StartContext = {
  language: string;
  langName: string;
  greeting: string;
  householdId: string;
  dependentId: string;
  useElevenlabs: boolean;
};

type StartPreflight =
  | { ok: true; context: StartContext }
  | { ok: false; reason: string };

type ParsedVapiError = {
  type?: string;
  stage?: string;
  statusCode?: number;
  message: string;
  isBadRequest: boolean;
  isStartMethodError: boolean;
};

interface VapiInstance {
  start: (assistantId: string, assistantOverrides?: any) => Promise<any>;
  stop: () => Promise<void> | void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

type VapiListeners = {
  onCallStart: () => void;
  onCallEnd: () => void;
  onCallStartFailed: (event: unknown) => void;
  onError: (event: unknown) => void;
};

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' ? (value as Record<string, any>) : null;
}

function parseVapiError(error: unknown): ParsedVapiError {
  const root = asRecord(error);
  const nested = asRecord(root?.error);

  const type = (root?.type || nested?.type) as string | undefined;
  const stage = (root?.stage || nested?.stage) as string | undefined;

  const numericStatus = [root?.statusCode, root?.status, nested?.statusCode, nested?.status].find(
    (value) => typeof value === 'number'
  ) as number | undefined;

  const message =
    (root?.message as string | undefined) ||
    (nested?.message as string | undefined) ||
    (root?.error as string | undefined) ||
    (typeof error === 'string' ? error : '') ||
    'Unknown Vapi start error';

  const normalized = `${type || ''} ${message}`.toLowerCase();

  return {
    type,
    stage,
    statusCode: numericStatus,
    message,
    isBadRequest: numericStatus === 400 || normalized.includes('bad request'),
    isStartMethodError: type === 'start-method-error' || normalized.includes('start-method-error'),
  };
}

function normalizeDeepgramLanguage(language: string): 'en-US' | 'multi' {
  return language === 'en' ? 'en-US' : 'multi';
}

function buildAssistantOverrides(context: StartContext) {
  const { language, householdId, dependentId, useElevenlabs, greeting, langName } = context;

  return {
    variableValues: {
      language,
      language_name: langName,  // Backend uses this for system prompt and voice selection
      household_id: householdId,
      dependent_id: dependentId,
      use_elevenlabs: useElevenlabs,
    },
    firstMessage: greeting,
  };
}

export function VoiceFAB() {
  const params = useParams();
  const dependentId = (params?.dependent_id as string) || '';

  const [isVapiReady, setIsVapiReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [premiumMode, setPremiumMode] = useState(false);

  const vapiRef = useRef<VapiInstance | null>(null);
  const listenersRef = useRef<VapiListeners | null>(null);
  const startInFlightRef = useRef(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkPremium = () => {
      setPremiumMode(localStorage.getItem('use_elevenlabs') === 'true');
    };
    checkPremium();
    window.addEventListener('languageChange', checkPremium);
    return () => window.removeEventListener('languageChange', checkPremium);
  }, []);

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

  const resetCallState = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    startInFlightRef.current = false;
  }, []);

  const handleStartFailure = useCallback(
    (error: unknown, stage: string, context?: StartContext) => {
      console.error(`VoiceFAB [${stage}] DIAGNOSTICS:`, {
        type: typeof error,
        string: String(error),
        proto: Object.prototype.toString.call(error),
        keys: error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [],
        vapiConfig: {
          hasPublicKey: !!VAPI_PUBLIC_KEY,
          hasAssistantId: !!VAPI_ASSISTANT_ID,
          keyStart: VAPI_PUBLIC_KEY?.slice(0, 4),
          assistantIdStart: VAPI_ASSISTANT_ID?.slice(0, 4),
        }
      });

      const errorJson = error instanceof Error 
        ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        : JSON.stringify(error, null, 2);
      
      console.error(`VoiceFAB [${stage}] RAW ERROR:`, errorJson);
      const parsed = parseVapiError(error);
      console.error(`VoiceFAB [${stage}] failed`, { parsed, context });

      let userMsg = parsed.message;
      if (parsed.isBadRequest) {
        userMsg = 'Vapi rejected the request. Please check settings.';
      } else if (parsed.isStartMethodError) {
        userMsg = 'Assistant initialization failed.';
      }

      setTransientError(userMsg);
      resetCallState();
    },
    [resetCallState, setTransientError]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !VAPI_PUBLIC_KEY) return;

    let mounted = true;

    import('@vapi-ai/web')
      .then((VapiModule) => {
        if (!mounted) return;
        const Vapi = VapiModule.default || VapiModule;
        const instance = new Vapi(VAPI_PUBLIC_KEY) as VapiInstance;
        vapiRef.current = instance;

        const listeners: VapiListeners = {
          onCallStart: () => {
            setIsActive(true);
            setIsConnecting(false);
            setCallError(null);
            clearErrorTimer();
          },
          onCallEnd: () => {
            resetCallState();
          },
          onCallStartFailed: (err) => {
            handleStartFailure(err, 'listener:call-start-failed');
          },
          onError: (err) => {
            handleStartFailure(err, 'listener:error');
          },
        };

        listenersRef.current = listeners;
        instance.on('call-start', listeners.onCallStart);
        instance.on('call-end', listeners.onCallEnd);
        instance.on('call-start-failed', listeners.onCallStartFailed);
        instance.on('error', listeners.onError);

        setIsVapiReady(true);
      })
      .catch((err) => {
        console.error('Vapi SDK load failed', err);
      });

    return () => {
      mounted = false;
      const instance = vapiRef.current;
      const listeners = listenersRef.current;

      if (instance && listeners) {
        instance.removeListener?.('call-start', listeners.onCallStart);
        instance.removeListener?.('call-end', listeners.onCallEnd);
        instance.removeListener?.('call-start-failed', listeners.onCallStartFailed);
        instance.removeListener?.('error', listeners.onError);
      }

      listenersRef.current = null;
      vapiRef.current = null;

      if (instance) {
        void Promise.resolve(instance.stop()).catch(() => {});
      }
    };
  }, [clearErrorTimer, handleStartFailure, resetCallState]);

  const readStartContext = useCallback((): StartPreflight => {
    if (typeof window === 'undefined') {
      return { ok: false, reason: 'Voice is available only in the browser.' };
    }

    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
      return { ok: false, reason: 'Voice is unavailable.' };
    }

    if (!isVapiReady || !vapiRef.current) {
      return { ok: false, reason: 'Assistant still loading.' };
    }

    const householdId = (localStorage.getItem('household_id') || '').trim();
    if (!householdId) {
      return { ok: false, reason: 'Select a household first.' };
    }

    const language = (localStorage.getItem('primary_language') || 'en').trim().toLowerCase();
    const useElevenlabs = localStorage.getItem('use_elevenlabs') === 'true';

    return {
      ok: true,
      context: {
        language,
        langName: LANGUAGE_NAMES[language] || 'English',
        greeting: FIRST_MESSAGES[language] || FIRST_MESSAGES.en,
        householdId,
        dependentId,
        useElevenlabs,
      },
    };
  }, [dependentId, isVapiReady]);

  const startCall = useCallback(async () => {
    if (startInFlightRef.current || isConnecting || isActive) return;

    startInFlightRef.current = true;
    setIsConnecting(true);
    setCallError(null);

    const preflight = readStartContext();
    if (!preflight.ok) {
      setTransientError(preflight.reason);
      resetCallState();
      return;
    }

    try {
      await vapiRef.current!.start(VAPI_ASSISTANT_ID, buildAssistantOverrides(preflight.context));
    } catch (error) {
      handleStartFailure(error, 'start:exception', preflight.context);
    } finally {
      startInFlightRef.current = false;
    }
  }, [handleStartFailure, isActive, isConnecting, readStartContext, resetCallState, setTransientError]);

  const stopCall = useCallback(async () => {
    startInFlightRef.current = false;
    try {
      await vapiRef.current?.stop();
    } catch (error) {
    } finally {
      resetCallState();
    }
  }, [resetCallState]);

  const toggleCall = useCallback(async () => {
    if (isConnecting && !isActive) return;
    if (isActive) {
      await stopCall();
    } else {
      await startCall();
    }
  }, [isActive, isConnecting, startCall, stopCall]);

  const fabPositionClass = 'bottom-32 md:bottom-12 right-6 md:right-12';
  const panelPositionClass = 'bottom-56 md:bottom-40 right-6 md:right-12';
  const errorPositionClass = 'bottom-52 md:bottom-36 right-6 md:right-12';

  return (
    <>
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${panelPositionClass} z-50 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-[20px_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_40px_rgba(0,0,0,0.5)] border border-blue-100 dark:border-slate-700 flex items-center gap-6`}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl ${premiumMode ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center`}>
                {premiumMode ? <Sparkles className="text-amber-500" size={24} /> : <Volume2 className="text-blue-500" size={24} />}
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute inset-0 ${premiumMode ? 'bg-amber-400/20' : 'bg-blue-400/20'} rounded-2xl -z-10`}
              />
            </div>
            <div className="pr-2">
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1">
                {premiumMode ? 'Premium Agent' : 'Health Assistant'}
              </p>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${premiumMode ? 'bg-amber-500' : 'bg-blue-500'} animate-pulse`} />
                <p className={`text-[10px] font-black ${premiumMode ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400'} uppercase tracking-[0.15em]`}>
                  Listening Now
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {callError && !isActive && (
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
          boxShadow: isActive
            ? '0px 0px 40px rgba(244, 63, 94, 0.4)'
            : premiumMode 
              ? '0px 0px 30px rgba(245, 158, 11, 0.3)' 
              : '10px 10px 20px rgba(59, 130, 246, 0.2)',
        }}
        disabled={isConnecting}
        className={`fixed ${fabPositionClass} w-16 h-16 md:w-20 md:h-20 rounded-[2.5rem] flex items-center justify-center z-50 transition-all duration-300 shadow-[inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.05)] ${
          isActive 
            ? 'bg-rose-500 text-white' 
            : premiumMode 
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin" strokeWidth={3} />
        ) : isActive ? (
          <Square className="w-8 h-8 md:w-10 md:h-10 fill-white" strokeWidth={3} />
        ) : premiumMode ? (
          <div className="relative">
            <Mic className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-white animate-pulse" />
          </div>
        ) : (
          <Mic className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
        )}
      </motion.button>
    </>
  );
}
