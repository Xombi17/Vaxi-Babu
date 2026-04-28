'use client';

import { useLiveAPI } from '@/hooks/use-live-api';

export function useGeminiVoiceBridge() {
  const { isConnected, isConnecting, connect, disconnect, error } = useLiveAPI();
  return { isConnected, isConnecting, connect, disconnect, error };
}
