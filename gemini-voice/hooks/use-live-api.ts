import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { searchPatientRecords, PatientRecord } from '@/lib/mockDatabase';

const fetchPatientRecordsDeclaration: FunctionDeclaration = {
  name: 'fetchPatientRecords',
  description: 'Search and fetch patient records from the database. Use this to look up vaccination history, general health, and children records. You can search by name, parent name, or condition.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query (e.g., patient name like "Emma", "Liam", or conditions).',
      },
    },
    required: ['query'],
  },
};

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [activeRecords, setActiveRecords] = useState<PatientRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const disconnect = useCallback(() => {
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
  }, []);

  const connect = useCallback(async (language: string = 'English') => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key is missing.');

      const ai = new GoogleGenAI({ apiKey });

      // Initialize Audio Context for playback
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      nextPlayTimeRef.current = audioCtx.currentTime;

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

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            // Setup Microphone processing
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
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' },
                });
              });
            };

            source.connect(processor);
            processor.connect(micCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
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
            }

            // Handle interruption
            if (message.serverContent?.interrupted && audioContextRef.current) {
              audioContextRef.current.close();
              const newAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
              audioContextRef.current = newAudioCtx;
              nextPlayTimeRef.current = newAudioCtx.currentTime;
            }

            // Handle tool calls
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                const responses = functionCalls.map(call => {
                  if (call.name === 'fetchPatientRecords') {
                    const args = call.args as { query: string };
                    const records = searchPatientRecords(args.query || '');
                    setActiveRecords(records);
                    return {
                      id: call.id,
                      name: call.name,
                      response: { records }
                    };
                  }
                  return {
                    id: call.id,
                    name: call.name,
                    response: { error: 'Unknown function' }
                  };
                });
                
                sessionPromise.then(session => {
                  session.sendToolResponse({ functionResponses: responses });
                });
              }
            }

            // Handle transcription
            const modelParts = message.serverContent?.modelTurn?.parts;
            if (modelParts) {
              const textPart = modelParts.find(p => p.text);
              if (textPart && textPart.text) {
                setTranscript(prev => [...prev, { role: 'model', text: textPart.text! }]);
              }
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err) => {
            console.error('Live API Error:', err);
            setError('An error occurred during the Live API session.');
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
          systemInstruction: `You are a professional, empathetic Data Health Assistant. You help users query patient records, check vaccination status (especially for children), and provide general health consultancy. Use the fetchPatientRecords tool when asked about specific patients or records. Keep your answers concise and conversational. IMPORTANT: You MUST converse entirely in ${language}.`,
          tools: [{ functionDeclarations: [fetchPatientRecordsDeclaration] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });

      // Handle incoming messages
      const session = await sessionPromise;
      sessionRef.current = session;
    } catch (err: any) {
      console.error('Failed to connect:', err);
      setError(err.message || 'Failed to connect to Live API');
      setIsConnecting(false);
      disconnect();
    }
  }, [isConnected, isConnecting, disconnect]);

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
