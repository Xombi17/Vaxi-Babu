import { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Type,
  FunctionDeclaration,
} from "@google/genai";
import {
  getHousehold,
  getDependents,
  getHealthPass,
  Household,
  Dependent,
  HealthPassResponse,
} from "@/lib/api";

const MAX_SESSION_DURATION = 15 * 60 * 1000; // 15 minutes
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

const getHouseholdDependentsDeclaration: FunctionDeclaration = {
  name: "get_household_dependents",
  description:
    "Fetches the list of all children/dependents linked to the user's household. Use this to identify which child the user is referring to.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      household_id: {
        type: Type.STRING,
        description: "The unique ID of the household to fetch dependents for.",
      },
    },
    required: ["household_id"],
  },
};

const getChildVaccinationStatusDeclaration: FunctionDeclaration = {
  name: "get_child_vaccination_status",
  description:
    "Fetches detailed vaccination status, health score, and upcoming due dates for a specific child.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      household_id: {
        type: Type.STRING,
        description: "The unique ID of the household.",
      },
      dependent_id: {
        type: Type.STRING,
        description: "The unique ID of the child/dependent.",
      },
    },
    required: ["household_id", "dependent_id"],
  },
};

// B1 — Today's priorities
const getTodaysPrioritiesDeclaration: FunctionDeclaration = {
  name: "get_todays_priorities",
  description:
    "Returns all overdue and due health actions across every household member. Call this when the user asks 'What should I do today?', 'What's urgent?', or anything about today's health tasks.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      household_id: {
        type: Type.STRING,
        description: "The unique ID of the household.",
      },
    },
    required: ["household_id"],
  },
};

// B2 — Voice-driven dependent creation
const addDependentByVoiceDeclaration: FunctionDeclaration = {
  name: "add_dependent_by_voice",
  description:
    "Creates a new family member (dependent) from voice input. Extract name, date_of_birth (YYYY-MM-DD), type (child/adult/elder/pregnant), and sex (male/female/other). First call with confirmed=false to show a preview. Then call again with confirmed=true after user says 'yes, confirm'.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      household_id: { type: Type.STRING, description: "The unique ID of the household." },
      name: { type: Type.STRING, description: "Full name of the person to add." },
      date_of_birth: { type: Type.STRING, description: "Date of birth in YYYY-MM-DD format." },
      type: { type: Type.STRING, description: "Type: child, adult, elder, or pregnant." },
      sex: { type: Type.STRING, description: "Sex: male, female, or other." },
      confirmed: { type: Type.BOOLEAN, description: "Set to true only after user confirms the preview." },
    },
    required: ["household_id", "name", "date_of_birth"],
  },
};

// B3 — Voice medicine safety check
const checkMedicineByVoiceDeclaration: FunctionDeclaration = {
  name: "check_medicine_by_voice",
  description:
    "Checks whether a medicine is safe to use based on its name. Use when user asks about a specific medicine by name, e.g. 'Is paracetamol safe for my baby?'. Extract medicine_name and optional concern (pregnancy, infant, allergy).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      medicine_name: { type: Type.STRING, description: "Name of the medicine to check." },
      concern: { type: Type.STRING, description: "Optional: pregnancy, infant, allergy, or general." },
      language: { type: Type.STRING, description: "Language code for the response (en, hi, mr, etc.)." },
    },
    required: ["medicine_name"],
  },
};

// B4 — Conversation memory
const getConversationContextDeclaration: FunctionDeclaration = {
  name: "get_conversation_context",
  description:
    "Retrieves the recent conversation history for this household. Use at the start of a session to recall what was discussed last time, e.g. pending vaccinations or follow-up actions.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

const saveConversationTurnDeclaration: FunctionDeclaration = {
  name: "save_conversation_turn",
  description:
    "Saves a key summary or important turn from the current conversation to memory. Use after resolving an important health query to help recall it next session.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING, description: "'user' or 'assistant'." },
      text: { type: Type.STRING, description: "The text to remember." },
    },
    required: ["role", "text"],
  },
};

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);
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
      streamRef.current.getTracks().forEach((track) => track.stop());
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
          console.warn(
            "[Protection] Session cap reached (15m). Disconnecting.",
          );
          disconnect();
        } else if (idleTime > INACTIVITY_TIMEOUT) {
          console.warn(
            "[Protection] Inactivity timeout reached (2m). Disconnecting.",
          );
          disconnect();
        }
      }, 5000); // Check every 5s
    }
    return () => {
      if (sessionTimeoutRef.current) clearInterval(sessionTimeoutRef.current);
    };
  }, [isConnected, disconnect]);

  const connect = useCallback(
    async (
      language: string = "English",
      householdId?: string,
      dependentId?: string,
    ) => {
      if (isConnected || isConnecting) return;
      setIsConnecting(true);
      setError(null);
      setTranscript([]);

      try {
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ||
          process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Google AI/Gemini API Key is missing.");

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
                  return {
                    name: dep.name,
                    stats: pass.stats,
                    nextDue: pass.next_due,
                  };
                } catch (e) {
                  console.warn(
                    `Could not fetch health pass for ${dep.name}:`,
                    e,
                  );
                  return { name: dep.name, stats: null, nextDue: null };
                }
              }),
            );

            healthSummary = healthData
              .map(
                (h) =>
                  `- ${h.name}: ${h.stats ? `${h.stats.completed_events}/${h.stats.total_events} vaccines done.` : "No health data available"}`,
              )
              .join("\n");
            console.log(
              "Fetched health summary for",
              dependents.length,
              "dependents",
            );
          } catch (e: any) {
            console.error("Backend fetch failed in connect():", e);
            // Don't throw, but mark as missing for the system instruction
            healthSummary = "Could not reach database for real-time records.";
          }
        }

        // Initialize protection timers
        sessionStartTimeRef.current = Date.now();
        lastActivityTimeRef.current = Date.now();

        const systemInstruction = `You are Vaxi — a warm, expert family health assistant for Vaxi Babu.

## Language
- The user's preferred language is ${language}.
- If ${language} is blank or missing, respond in the language the user is speaking.
- Do not mix languages in one sentence.

## Critical Data Rule: Never invent IDs
- NEVER fabricate or guess household_id or dependent_id.
- NEVER use placeholder strings like "your_household_id", "user's household ID", or "child's ID".
- If household_id is missing, you MUST say you cannot access household records and ask the user to open the app.

## Privacy / UX
- NEVER read out or repeat any internal IDs (UUIDs), dependent_id values, household_id values, or database identifiers.
- If a tool response contains IDs, ignore them in spoken output.

## Runtime Context
- Household ID: ${householdId || "MISSING"}

## Session Start (ALWAYS do both steps)
1. Call get_conversation_context to check if there is any history from a previous session. If yes, briefly mention it: "Last time we discussed...".
2. Call get_household_dependents to load the current list of family members.

## B1 — What Should I Do Today?
- When the user asks "What should I do today?", "What's pending?", "Any urgent tasks?", or similar → call get_todays_priorities.
- Read the top 3 results aloud clearly: who needs what action, and how urgent it is.
- If no priorities, say "Great news — everything is on track for your family today!"

## B2 — Add a New Family Member by Voice
- If user says "Add my son/daughter/wife/parent" or "Add [Name] to the family" → collect: name, date of birth, type (child/adult/elder/pregnant), sex.
- Ask one question at a time if any field is missing.
- Once you have all fields, call add_dependent_by_voice with confirmed=false. Read the preview aloud and ask for confirmation.
- Only call add_dependent_by_voice with confirmed=true after the user explicitly says "yes" or "confirm".
- Never save without confirmation.

## B3 — Medicine Safety Check by Voice
- If user asks "Is [medicine] safe?", "Can I give [medicine] to my child?", or similar → extract the medicine name and optional concern, then call check_medicine_by_voice.
- Read the verdict and reason aloud simply and clearly.
- Always end with: "This is general guidance. Please consult your doctor for personal medical advice."

## B4 — Conversation Memory
- At the start of every session, call get_conversation_context. If history exists, mention relevant past context.
- After resolving an important health query (e.g., a vaccination status question), call save_conversation_turn with a short summary of the key result.
- Example: save role='assistant', text='User asked about Arjun's BCG status. It is overdue by 5 days.'

## Tool Use (existing)
- When the user asks about their children or vaccinations, call get_household_dependents first (if not already done).
- For any vaccination-related query for a specific child, call get_child_vaccination_status with the real household_id and dependent_id.

## Medical Safety
- Do NOT diagnose.
- For emergencies (trouble breathing, chest pain, seizures, severe bleeding, unconsciousness), tell the user to seek emergency care immediately (call 108 / nearest clinic).

## Style
- Use short, clear sentences.
- Before calling a tool, say what you are doing (e.g., "Let me check today's priorities for your family.").
- Be calm, empathetic, and encouraging.
- Never read UUIDs or technical identifiers aloud.`;

        // Initialize Audio Context for playback
        let audioCtx: AudioContext;
        try {
          if (typeof window === "undefined")
            throw new Error("Window undefined");
          audioCtx = new (
            window.AudioContext || (window as any).webkitAudioContext
          )({ sampleRate: 24000 });

          // Resume audio context if suspended (required by browser autoplay policies)
          if (audioCtx.state === "suspended") {
            await audioCtx.resume();
            console.log("AudioContext resumed from suspended state");
          }
          console.log("AudioContext initialized, state:", audioCtx.state);
        } catch (e) {
          console.error("Failed to init AudioContext:", e);
          throw new Error(
            "Audio issues. Please ensure you are in a modern browser.",
          );
        }
        audioContextRef.current = audioCtx;
        nextPlayTimeRef.current = audioCtx.currentTime;

        console.log("Voice session connecting with:", {
          language,
          householdId,
        });

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
          model: "gemini-3.1-flash-live-preview",

          callbacks: {
            onopen: () => {
              console.log("Gemini Live session opened successfully.");
              setIsConnected(true);
              setIsConnecting(false);

              const micCtx = new (
                window.AudioContext || (window as any).webkitAudioContext
              )({ sampleRate: 16000 });
              const source = micCtx.createMediaStreamSource(stream);
              sourceRef.current = source;
              const processor = micCtx.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;

              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  pcm16[i] = Math.max(
                    -32768,
                    Math.min(32767, inputData[i] * 32768),
                  );
                }
                const buffer = new Uint8Array(pcm16.buffer);
                let binary = "";
                for (let i = 0; i < buffer.byteLength; i++) {
                  binary += String.fromCharCode(buffer[i]);
                }
                const base64Data = btoa(binary);

                const currentSession = sessionRef.current;
                if (currentSession) {
                  currentSession.sendRealtimeInput({
                    audio: {
                      data: base64Data,
                      mimeType: "audio/pcm;rate=16000",
                    },
                  });
                }
              };

              source.connect(processor);
              processor.connect(micCtx.destination);
            },
            onerror: (err: any) => {
              console.error("Gemini Live session error:", err);
              setError(err.message || "Connection error");
              setIsConnecting(false);
              disconnect();
            },
            onclose: (event: any) => {
              console.log("Gemini Live session closed:", event);
              setIsConnected(false);
              setIsConnecting(false);
            },

            onmessage: async (message: LiveServerMessage) => {
              if (message.setupComplete) {
                console.log("Gemini setup complete. Sending initial greeting...");
                const initialPrompt = `Hello! Please greet me in ${language || 'English'}, introduce yourself as the Vaxi Babu Health Assistant, and ask how you can help me with my family's health today.`;
                if (sessionRef.current) {
                  // Using sendClientContent as per SDK definition
                  (sessionRef.current as any).sendClientContent({
                    turns: [{ role: "user", parts: [{ text: initialPrompt }] }],
                    turnComplete: true,
                  });
                }
              }

              console.log("Gemini message received:", message);

              const base64Audio =
                message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                console.log("Playing audio chunk, length:", base64Audio.length);
                const audioCtx = audioContextRef.current;
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcm16 = new Int16Array(bytes.buffer);
                const audioBuffer = audioCtx.createBuffer(
                  1,
                  pcm16.length,
                  24000,
                );
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
                console.log(
                  "Audio scheduled to play at:",
                  nextPlayTimeRef.current,
                );
              }

              if (
                message.serverContent?.interrupted &&
                audioContextRef.current
              ) {
                audioContextRef.current.close();
                const newAudioCtx = new (
                  window.AudioContext || (window as any).webkitAudioContext
                )({ sampleRate: 24000 });
                audioContextRef.current = newAudioCtx;
                nextPlayTimeRef.current = newAudioCtx.currentTime;
              }

              if (message.toolCall) {
                lastActivityTimeRef.current = Date.now(); // Reset inactivity timer
                const functionCalls = message.toolCall.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                  const responses = await Promise.all(
                    functionCalls.map(async (call) => {
                      try {
                        if (call.name === "get_household_dependents") {
                          const args = call.args as { household_id: string };
                          const hid = args.household_id || householdId;
                          if (!hid)
                            return {
                              id: call.id,
                              name: call.name,
                              response: { error: "Household ID missing" },
                            };

                          const result = await getDependents(hid);
                          setDependentsList(result);
                          return {
                            id: call.id,
                            name: call.name,
                            response: { dependents: result },
                          };
                        }

                        if (call.name === "get_child_vaccination_status") {
                          const args = call.args as {
                            household_id: string;
                            dependent_id: string;
                          };
                          const hid = args.household_id || householdId;
                          if (!hid || !args.dependent_id) {
                            return {
                              id: call.id,
                              name: call.name,
                              response: { error: "ID missing" },
                            };
                          }

                          const result = await getHealthPass(args.dependent_id);
                          return {
                            id: call.id,
                            name: call.name,
                            response: { health_pass: result },
                          };
                        }

                        // B1 — Today's priorities
                        if (call.name === "get_todays_priorities") {
                          const args = call.args as { household_id?: string };
                          const hid = args.household_id || householdId;
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/voice/tools/get-todays-priorities`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ household_id: hid }),
                          });
                          const data = await res.json();
                          return { id: call.id, name: call.name, response: data };
                        }

                        // B2 — Add dependent by voice
                        if (call.name === "add_dependent_by_voice") {
                          const args = call.args as {
                            household_id?: string;
                            name: string;
                            date_of_birth: string;
                            type?: string;
                            sex?: string;
                            confirmed?: boolean;
                          };
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/voice/tools/add-dependent-by-voice`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ ...args, household_id: args.household_id || householdId }),
                          });
                          const data = await res.json();
                          return { id: call.id, name: call.name, response: data };
                        }

                        // B3 — Medicine safety check by voice
                        if (call.name === "check_medicine_by_voice") {
                          const args = call.args as {
                            medicine_name: string;
                            concern?: string;
                            language?: string;
                          };
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/voice/tools/check-medicine-by-voice`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ ...args, language: args.language || 'en' }),
                          });
                          const data = await res.json();
                          return { id: call.id, name: call.name, response: data };
                        }

                        // B4 — Get conversation context
                        if (call.name === "get_conversation_context") {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/voice/tools/get-conversation-context`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({}),
                          });
                          const data = await res.json();
                          return { id: call.id, name: call.name, response: data };
                        }

                        // B4 — Save conversation turn
                        if (call.name === "save_conversation_turn") {
                          const args = call.args as { role: string; text: string };
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/voice/tools/save-conversation-turn`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify(args),
                          });
                          const data = await res.json();
                          return { id: call.id, name: call.name, response: data };
                        }
                      } catch (err) {
                        return {
                          id: call.id,
                          name: call.name,
                          response: { error: "Tool execution failed" },
                        };
                      }
                      return {
                        id: call.id,
                        name: call.name,
                        response: { error: "Unknown function" },
                      };
                    }),
                  );

                  if (sessionRef.current) {
                    sessionRef.current.sendToolResponse({
                      functionResponses: responses,
                    });
                  }
                }
              }

              const modelParts = message.serverContent?.modelTurn?.parts;
              if (modelParts) {
                const textPart = modelParts.find((p) => p.text);
                if (textPart && textPart.text) {
                  setTranscript((prev) => [
                    ...prev,
                    { role: "model", text: textPart.text! },
                  ]);
                }
              }

              const inputTranscription =
                message.serverContent?.inputTranscription;
              if (inputTranscription && inputTranscription.text) {
                lastActivityTimeRef.current = Date.now(); // Reset inactivity timer
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  if (
                    last &&
                    last.role === "user" &&
                    !inputTranscription.finished
                  ) {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "user",
                      text: inputTranscription.text!,
                    };
                    return updated;
                  } else {
                    return [
                      ...prev,
                      { role: "user", text: inputTranscription.text! },
                    ];
                  }
                });
              }
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
            },
            systemInstruction: systemInstruction,
            tools: [
              {
                functionDeclarations: [
                  getHouseholdDependentsDeclaration,
                  getChildVaccinationStatusDeclaration,
                  getTodaysPrioritiesDeclaration,
                  addDependentByVoiceDeclaration,
                  checkMedicineByVoiceDeclaration,
                  getConversationContextDeclaration,
                  saveConversationTurnDeclaration,
                ],
              },
            ],
          },
        });

        sessionRef.current = aiSession;
      } catch (err: any) {
        console.error("Connection process failed:", err);
        let errorMessage = err.message || "Failed to connect to Live API";
        
        if (err.name === "NotFoundError" || err.message.includes("Requested device not found")) {
          errorMessage = "Microphone not found. Please connect a microphone.";
        } else if (err.name === "NotAllowedError" || err.message.includes("Permission denied")) {
          errorMessage = "Microphone permission denied. Please allow microphone access.";
        }
        
        setError(errorMessage);
        setIsConnecting(false);
        setIsConnected(false);
        // Clean up any partial state
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    },
    [isConnected, isConnecting, disconnect],
  );

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    transcript,
    activeRecords,
    error,
  };
}
