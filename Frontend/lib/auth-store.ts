import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAuthTokens, getAuthState, setAuthTokens } from '@/lib/auth';

export type Language = 'English' | 'Hindi' | 'Marathi' | 'Gujarati' | 'Bengali' | 'Tamil' | 'Telugu';

interface AuthState {
  token: string | null;
  userId: string | null;
  householdId: string | null;
  isLoggedIn: boolean;
  language: Language;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  chwMode: boolean;
  voiceFabOpen: boolean;
  sidebarOpen: boolean;
  loginWithToken: (token: string, userId: string, householdId: string, familyName?: string) => void;
  logout: () => void;
  hydrateFromLocalAuth: () => void;
  setLanguage: (lang: Language) => void;
  toggleVoice: () => void;
  toggleNotifications: () => void;
  toggleCHWMode: () => void;
  setVoiceFabOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      householdId: null,
      isLoggedIn: false,
      language: 'English',
      voiceEnabled: true,
      notificationsEnabled: true,
      chwMode: false,
      voiceFabOpen: false,
      sidebarOpen: false,

      loginWithToken: (token, userId, householdId, familyName) => {
        setAuthTokens(token, householdId, familyName);
        set({ token, userId, householdId, isLoggedIn: true });
      },

      logout: () => {
        clearAuthTokens();
        set({
          token: null,
          userId: null,
          householdId: null,
          isLoggedIn: false,
        });
      },

      hydrateFromLocalAuth: () => {
        var auth = getAuthState();
        set({
          token: auth.token,
          userId: auth.householdId,
          householdId: auth.householdId,
          isLoggedIn: auth.isAuthenticated,
        });
      },

      setLanguage: (lang) => set({ language: lang }),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      toggleCHWMode: () => set((s) => ({ chwMode: !s.chwMode })),
      setVoiceFabOpen: (open) => set({ voiceFabOpen: open }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'Vaxi Babu-auth',
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        householdId: state.householdId,
        isLoggedIn: state.isLoggedIn,
        language: state.language,
        voiceEnabled: state.voiceEnabled,
        notificationsEnabled: state.notificationsEnabled,
        chwMode: state.chwMode,
      }),
    }
  )
);
