'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
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
  const { language, langName, greeting, householdId, dependentId } = context;

  return {
    firstMessage: greeting,
    transcriber: {
      provider: 'deepgram',
      language: normalizeDeepgramLanguage(language),
    },
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the WellSync health assistant for a real family.
                STRICT RULE: The user prefers ${langName}. You MUST respond ONLY in ${langName}.
                ANTI-DEMO RULE: Never mention names like Olivia, Jackson, Emily, Emma, or any names not related to the current user.

                DYNAMIC CONTEXT:
                - Household ID: ${householdId}
                - Selected Language: ${langName}

                ACTION: At the very beginning of the call, if you don't already have the names of the children in your prompt, you MUST call 'get_household_dependents' immediately to discover who is in this family.

                When the user asks about vaccines or health, call 'get_child_vaccination_status'.

                Goals:
                - Identify children by name using tools.
                - Help parents understand vaccination status.
                - Provide health education in ${langName}.

                Medical Safety:
                - NO diagnosis. If emergency, instruct to seek immediate medical care.
                - Never fabricate data.

                Style: Simple, short sentences. Confirm actions.`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_household_dependents',
            description: 'List all members/children in the household to know their real names.',
            parameters: {
              type: 'object',
              properties: {
                household_id: { type: 'string', description: 'The ID of the family household.' },
              },
              required: ['household_id'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_child_vaccination_status',
            description: 'Get the vaccination and health status for a specific child.',
            parameters: {
              type: 'object',
              properties: {
                dependent_id: { type: 'string', description: 'The ID of the child.' },
                household_id: { type: 'string', description: 'The ID of the family household.' },
              },
              required: ['household_id'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'answer_health_question',
            description: 'Answer complex health questions using full medical history context.',
            parameters: {
              type: 'object',
              properties: {
                question: { type: 'string', description: "The user's question." },
                household_id: { type: 'string', description: 'The ID of the family household.' },
                dependent_id: { type: 'string', description: "The child's ID." },
                language: { type: 'string', description: 'Language code.' },
              },
              required: ['question', 'household_id'],
            },
          },
        },
      ],
    },
    variableValues: {
      household_id: householdId,
      dependent_id: dependentId,
      language,
      language_name: langName,
      first_message: greeting,
    },
  };
}

export function VoiceFAB() {
  const params = useParams();
  const dependentId = (params?.dependent_id as string | undefined) || '';
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVapiReady, setIsVapiReady] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const vapiRef = useRef<VapiInstance | null>(null);
  const listenersRef = useRef<VapiListeners | null>(null);
  const startInFlightRef = useRef(false);
  const errorTimerRef = useRef<number | null>(null);

  const panelPositionClass =
    'bottom-44 left-1/2 -translate-x-1/2 md:bottom-32 md:right-8 md:left-auto md:translate-x-0';
  const errorPositionClass =
    'bottom-40 left-1/2 -translate-x-1/2 md:bottom-28 md:right-8 md:left-auto md:translate-x-0';
  const fabPositionClass =
    'bottom-24 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0';

  const clearErrorTimer = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const setTransientError = useCallback(
    (message: string) => {
      setCallError(message);

      if (typeof window === 'undefined') {
        return;
      }

      clearErrorTimer();
      errorTimerRef.current = window.setTimeout(() => {
        setCallError(null);
        errorTimerRef.current = null;
      }, 6000);
    },
    [clearErrorTimer]
  );

  const resetCallState = useCallback(() => {
    startInFlightRef.current = false;
    setIsConnecting(false);
    setIsActive(false);
  }, []);

  const handleStartFailure = useCallback(
    (error: unknown, source: string, context: Partial<StartContext> = {}) => {
      const parsed = parseVapiError(error);
      const isRequestFailure = parsed.isBadRequest || parsed.isStartMethodError;

      const userMessage = isRequestFailure
        ? 'Voice request was rejected. Please verify household context and Vapi assistant configuration.'
        : 'Could not start voice assistant. Please try again.';

      console.error('VoiceFAB start failure', {
        source,
        type: parsed.type,
        stage: parsed.stage,
        statusCode: parsed.statusCode,
        message: parsed.message,
        isBadRequest: parsed.isBadRequest,
        isStartMethodError: parsed.isStartMethodError,
        assistantId: VAPI_ASSISTANT_ID,
        hasPublicKey: Boolean(VAPI_PUBLIC_KEY),
        context,
      });

      setTransientError(userMessage);
      resetCallState();
    },
    [resetCallState, setTransientError]
  );

  // Dynamic import of Vapi SDK to avoid SSR issues.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!VAPI_PUBLIC_KEY) {
      console.warn('VoiceFAB: NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing. Voice calls are disabled.');
      return;
    }

    let disposed = false;

    const initVapi = async () => {
      if (vapiRef.current) {
        setIsVapiReady(true);
        return;
      }

      try {
        const VapiModule = await import('@vapi-ai/web');
        if (disposed) {
          return;
        }

        const VapiConstructor = VapiModule.default || VapiModule;
        // @ts-ignore - Vapi constructor types can be tricky with ESM/CJS interop.
        const vapiInstance = new VapiConstructor(VAPI_PUBLIC_KEY) as VapiInstance;

        vapiRef.current = vapiInstance;
        setIsVapiReady(true);

        const onCallStart = () => {
          startInFlightRef.current = false;
          clearErrorTimer();
          setCallError(null);
          setIsConnecting(false);
          setIsActive(true);
        };

        const onCallEnd = () => {
          resetCallState();
        };

        const onCallStartFailed = (event: unknown) => {
          handleStartFailure(event, 'event:call-start-failed');
        };

        const onError = (event: unknown) => {
          const parsed = parseVapiError(event);
          if (parsed.isBadRequest || parsed.isStartMethodError) {
            handleStartFailure(event, 'event:error');
            return;
          }

          console.error('VoiceFAB runtime error', {
            type: parsed.type,
            stage: parsed.stage,
            message: parsed.message,
            statusCode: parsed.statusCode,
          });

          resetCallState();
        };

        listenersRef.current = {
          onCallStart,
          onCallEnd,
          onCallStartFailed,
          onError,
        };

        vapiInstance.on('call-start', onCallStart);
        vapiInstance.on('call-end', onCallEnd);
        vapiInstance.on('call-start-failed', onCallStartFailed);
        vapiInstance.on('error', onError);
      } catch (err) {
        if (!disposed) {
          console.warn('Vapi SDK could not be initialized. Voice calls are disabled.', err);
          setIsVapiReady(false);
        }
      }
    };

    initVapi();

    return () => {
      disposed = true;

      clearErrorTimer();
      startInFlightRef.current = false;

      const instance = vapiRef.current;
      const listeners = listenersRef.current;

      if (instance && listeners && instance.removeListener) {
        instance.removeListener('call-start', listeners.onCallStart);
        instance.removeListener('call-end', listeners.onCallEnd);
        instance.removeListener('call-start-failed', listeners.onCallStartFailed);
        instance.removeListener('error', listeners.onError);
      }

      listenersRef.current = null;
      vapiRef.current = null;

      if (instance) {
        void Promise.resolve(instance.stop()).catch(() => {
          // no-op: cleanup should not throw during unmount
        });
      }
    };
  }, [clearErrorTimer, handleStartFailure, resetCallState]);

  const readStartContext = useCallback((): StartPreflight => {
    if (typeof window === 'undefined') {
      return { ok: false, reason: 'Voice is available only in the browser.' };
    }

    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) {
      return { ok: false, reason: 'Voice is unavailable because Vapi configuration is missing.' };
    }

    if (!isVapiReady || !vapiRef.current) {
      return { ok: false, reason: 'Voice assistant is still loading. Please try again.' };
    }

    const householdId = (localStorage.getItem('household_id') || '').trim();
    if (!householdId) {
      return { ok: false, reason: 'Please select or create a household before starting voice.' };
    }

    const rawLanguage = (localStorage.getItem('primary_language') || 'en').trim().toLowerCase();
    const language = Object.prototype.hasOwnProperty.call(FIRST_MESSAGES, rawLanguage)
      ? rawLanguage
      : 'en';

    return {
      ok: true,
      context: {
        language,
        langName: LANGUAGE_NAMES[language] || 'English',
        greeting: FIRST_MESSAGES[language] || FIRST_MESSAGES.en,
        householdId,
        dependentId,
      },
    };
  }, [dependentId, isVapiReady]);

  const startCall = useCallback(async () => {
    if (startInFlightRef.current || isConnecting || isActive) {
      return;
    }

    startInFlightRef.current = true;
    setIsConnecting(true);
    setCallError(null);

    const preflight = readStartContext();
    if (!preflight.ok) {
      console.warn('VoiceFAB preflight failed', { reason: preflight.reason });
      setTransientError(preflight.reason);
      resetCallState();
      return;
    }

    try {
      console.info('VoiceFAB: Starting Vapi call', {
        assistantId: VAPI_ASSISTANT_ID,
        householdId: preflight.context.householdId,
        dependentId: preflight.context.dependentId,
        language: preflight.context.language,
      });

      const call = await vapiRef.current!.start(
        VAPI_ASSISTANT_ID,
        buildAssistantOverrides(preflight.context)
      );

      if (!call) {
        handleStartFailure(
          {
            type: 'start-method-error',
            stage: 'start-call',
            message: 'Vapi start returned null call object.',
            statusCode: 400,
          },
          'start:null-call',
          preflight.context
        );
      }
    } catch (error) {
      handleStartFailure(error, 'start:exception', preflight.context);
    } finally {
      startInFlightRef.current = false;
    }
  }, [
    handleStartFailure,
    isActive,
    isConnecting,
    readStartContext,
    resetCallState,
    setTransientError,
  ]);

  const stopCall = useCallback(async () => {
    startInFlightRef.current = false;
    try {
      await vapiRef.current?.stop();
    } catch (error) {
      console.error('VoiceFAB stop failure', error);
    } finally {
      resetCallState();
    }
  }, [resetCallState]);

  const toggleCall = useCallback(async () => {
    if (isConnecting && !isActive) {
      return;
    }

    if (isActive) {
      await stopCall();
      return;
    }

    await startCall();
  }, [isActive, isConnecting, startCall, stopCall]);

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
            : '10px 10px 20px rgba(59, 130, 246, 0.2)',
        }}
        disabled={isConnecting}
        title={callError || undefined}
        className={`fixed ${fabPositionClass} w-16 h-16 md:w-20 md:h-20 rounded-[2.5rem] flex items-center justify-center z-50 transition-all duration-300 shadow-[inset_4px_4px_10px_rgba(255,255,255,0.4),inset_-4px_-4px_10px_rgba(0,0,0,0.05)] ${
          isActive ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
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
