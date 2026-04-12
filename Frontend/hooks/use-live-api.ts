import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { 
  getHousehold, 
  getDependents, 
  getHealthPass, 
  Household, 
  Dependent,
  HealthPassResponse
} from '@/lib/api';

const getHouseholdDependentsDeclaration: FunctionDeclaration = {
  name: 'get_household_dependents',
  description: 'Fetches the list of all children/dependents linked to the user\'s household. Use this to identify which child the user is referring to.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      household_id: {
        type: Type.STRING,
        description: 'The unique ID of the household to fetch dependents for.',
      },
    },
    required: ['household_id'],
  },
};

const getChildVaccinationStatusDeclaration: FunctionDeclaration = {
  name: 'get_child_vaccination_status',
  description: 'Fetches detailed vaccination status, health score, and upcoming due dates for a specific child.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      household_id: {
        type: Type.STRING,
        description: 'The unique ID of the household.',
      },
      dependent_id: {
        type: Type.STRING,
        description: 'The unique ID of the child/dependent.',
      },
    },
    required: ['household_id', 'dependent_id'],
  },
};

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [activeRecords, setActiveRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dependentsList, setDependentsList] = useState<Dependent[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  // Protection & Usage Counters
  const sessionStartTimeRef = useRef<number>(0);
  const lastActivityTimeRef = useRef<number>(0);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_SESSION_DURATION = 15 * 60 * 1000; // 15 minutes
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000;    // 2 minutes

  const stopSessionPolicing = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearInterval(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    stopSessionPolicing();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, [stopSessionPolicing]);


  // Session policing timer
  useEffect(() => {
    if (isConnected) {
      sessionTimeoutRef.current = setInterval(() => {
        const now = Date.now();
        const sessionAge = now - sessionStartTimeRef.current;
        const idleTime = now - lastActivityTimeRef.current;

        if (sessionAge > MAX_SESSION_DURATION) {
          console.warn("[Protection] Session cap reached (15m). Disconnecting.");
          disconnect();
        } else if (idleTime > INACTIVITY_TIMEOUT) {
          console.warn("[Protection] Inactivity timeout reached (2m). Disconnecting.");
          disconnect();
        }
      }, 5000); // Check every 5s
    }
    return () => {
      if (sessionTimeoutRef.current) clearInterval(sessionTimeoutRef.current);
    };
  }, [isConnected, disconnect]);

  const connect = useCallback(async (
    language: string = 'English', 
    householdId?: string
  ) => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    setTranscript([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key is missing.');

      const ai = new GoogleGenAI({ apiKey });

      // Fetch real data
      let householdInfo: Household | null = null;
      let dependents: Dependent[] = [];
      let healthSummary = "";

      if (householdId) {
        try {
          console.log(`Fetching records for household: ${householdId}...`);
          householdInfo = await getHousehold(householdId);
          dependents = await getDependents(householdId);
          setDependentsList(dependents);
          
          const healthData = await Promise.all(
            dependents.map(async (dep) => {
              try {
                const pass = await getHealthPass(dep.id);
                return { name: dep.name, stats: pass.stats, nextDue: pass.next_due };
              } catch (e) {
                console.warn(`Could not fetch health pass for ${dep.name}:`, e);
                return { name: dep.name, stats: null, nextDue: null };
              }
            })
          );

          healthSummary = healthData.map(h => 
            `- ${h.name}: ${h.stats ? `${h.stats.completed_events}/${h.stats.total_events} vaccines done.` : 'No health data available'}`
          ).join('\n');
          console.log('Fetched health summary for', dependents.length, 'dependents');
        } catch (e: any) {
          console.error("Backend fetch failed in connect():", e);
          // Don't throw, but mark as missing for the system instruction
          healthSummary = "Could not reach database for real-time records.";
        }
      }


      // Initialize protection timers
      sessionStartTimeRef.current = Date.now();
      lastActivityTimeRef.current = Date.now();

      const systemInstruction = `You are a helpful family health assistant for WellSync AI.

## Language
- The user's preferred language is ${language}.
- If ${language} is blank or missing, respond in the language the user is speaking.
- Do not mix languages in one sentence.

## Critical Data Rule: Never invent IDs
- NEVER fabricate or guess household_id or dependent_id.
- NEVER use placeholder strings like "your_household_id", "user's household ID", "child's ID", "unknown".
- If household_id is missing, you MUST say you cannot access household records and ask the user to open the app / sign in.

## Privacy / UX
- NEVER read out or repeat any internal IDs (UUIDs), dependent_id values, household_id values, or database identifiers.
- If a tool response contains IDs, ignore them in spoken output.

## Runtime Context
- Household ID: ${householdId || 'MISSING'}

## Mandatory Prefetch (ALWAYS)
- On the FIRST user message of EVERY call, you MUST immediately call get_household_dependents to get the list of children in the household.
- After calling it, wait for the tool result. Then continue.

## Tool Use (required)
- When the user asks about their children or vaccinations, call get_household_dependents first (if you have not already) and use the returned dependents list.
- IMPORTANT: If get_household_dependents returned at least one dependent, you DO have the child names. Do not claim you don't have their name.
- If the user asks "what is my child's name" and the query was resolved, answer with the name(s) you have.
- For any vaccination-related query, call get_child_vaccination_status with the real household_id and the real dependent_id from the dependents list (never the child's name).
- If the user asks about "my children" without specifying which child, ask which child by name from the list.

## If no children are found
- If the dependents tool returns an empty list, explain that there are no children linked to this household and ask whether they'd like to add a child or proceed with general vaccine schedule guidance.

## Medical Safety
- Do NOT diagnose.
- For emergencies (trouble breathing, chest pain, seizures, severe bleeding, unconsciousness), tell the user to seek emergency care immediately (call 108 / nearest clinic).

## Style
- Use short, clear sentences.
- Before calling a tool, say what you are doing (e.g., "I’m checking your household records now.").
- Be calm, empathetic, and encouraging.`;

      // Initialize Audio Context for playback
      let audioCtx: AudioContext;
      try {
        if (typeof window === 'undefined') throw new Error('Window undefined');
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Resume audio context if suspended (required by browser autoplay policies)
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
          console.log('AudioContext resumed from suspended state');
        }
        console.log('AudioContext initialized, state:', audioCtx.state);
      } catch (e) {
        console.error('Failed to init AudioContext:', e);
        throw new Error('Audio issues. Please ensure you are in a modern browser.');
      }
      audioContextRef.current = audioCtx;
      nextPlayTimeRef.current = audioCtx.currentTime;

      console.log('Voice session connecting with:', { language, householdId });


      // Request Microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const aiSession = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',

        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened successfully.');
            setIsConnected(true);
            setIsConnecting(false);

            const micCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = micCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            const processor = micCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              const buffer = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < buffer.byteLength; i++) {
                binary += String.fromCharCode(buffer[i]);
              }
              const base64Data = btoa(binary);

              const currentSession = sessionRef.current;
              if (currentSession) {
                currentSession.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' },
                });
              }
            };

            source.connect(processor);
            processor.connect(micCtx.destination);
          },
          onerror: (err: any) => {
            console.error('Gemini Live session error:', err);
            setError(err.message || 'Connection error');
            setIsConnecting(false);
            disconnect();
          },
          onclose: (event: any) => {
            console.log('Gemini Live session closed:', event);
            setIsConnected(false);
            setIsConnecting(false);
          },

          onmessage: async (message: LiveServerMessage) => {
            console.log('Gemini message received:', message);

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              console.log('Playing audio chunk, length:', base64Audio.length);
              const audioCtx = audioContextRef.current;
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const audioBuffer = audioCtx.createBuffer(1, pcm16.length, 24000);
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < pcm16.length; i++) {
                channelData[i] = pcm16[i] / 32768;
              }
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);

              const currentTime = audioCtx.currentTime;
              if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime;
              }
              source.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;
              console.log('Audio scheduled to play at:', nextPlayTimeRef.current);
            }

            if (message.serverContent?.interrupted && audioContextRef.current) {
              audioContextRef.current.close();
              const newAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
              audioContextRef.current = newAudioCtx;
              nextPlayTimeRef.current = newAudioCtx.currentTime;
            }

            if (message.toolCall) {
              lastActivityTimeRef.current = Date.now(); // Reset inactivity timer
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                const responses = await Promise.all(functionCalls.map(async call => {
                  try {
                    if (call.name === 'get_household_dependents') {
                      const args = call.args as { household_id: string };
                      const hid = args.household_id || householdId;
                      if (!hid) return { id: call.id, name: call.name, response: { error: 'Household ID missing' } };
                      
                      const result = await getDependents(hid);
                      setDependentsList(result);
                      return {
                        id: call.id,
                        name: call.name,
                        response: { dependents: result }
                      };
                    }
                    
                    if (call.name === 'get_child_vaccination_status') {
                      const args = call.args as { household_id: string, dependent_id: string };
                      const hid = args.household_id || householdId;
                      if (!hid || !args.dependent_id) {
                        return { id: call.id, name: call.name, response: { error: 'ID missing' } };
                      }
                      
                      const result = await getHealthPass(args.dependent_id);
                      return {
                        id: call.id,
                        name: call.name,
                        response: { health_pass: result }
                      };
                    }
                  } catch (err) {
                    return { id: call.id, name: call.name, response: { error: 'Tool execution failed' } };
                  }
                  return { id: call.id, name: call.name, response: { error: 'Unknown function' } };
                }));
                
                if (sessionRef.current) {
                  sessionRef.current.sendToolResponse({ functionResponses: responses });
                }
              }
            }

            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              const textPart = modelParts.find(p => p.text);
              if (textPart && textPart.text) {
                setTranscript(prev => [...prev, { role: 'model', text: textPart.text! }]);
              }
            }

            const inputTranscription = message.serverContent?.inputTranscription;
            if (inputTranscription && inputTranscription.text) {
              lastActivityTimeRef.current = Date.now(); // Reset inactivity timer
              setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'user' && !inputTranscription.finished) {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'user', text: inputTranscription.text! };
                  return updated;
                } else {
                  return [...prev, { role: 'user', text: inputTranscription.text! }];
                }
              });
            }
          }
        },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
            },
            systemInstruction: systemInstruction,
            tools: [{
              functionDeclarations: [
                getHouseholdDependentsDeclaration,
                getChildVaccinationStatusDeclaration
              ]
            }],
          },
      });

      sessionRef.current = aiSession;
    } catch (err: any) {
      console.error('Connection process failed:', err);
      setError(err.message || 'Failed to connect to Live API');
      setIsConnecting(false);
      setIsConnected(false);
      // Clean up any partial state
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isConnected, isConnecting, stopSessionPolicing, disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    transcript,
    activeRecords,
    error
  };
}
