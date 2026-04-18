import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAuthTokens, getAuthState, setAuthTokens } from '@/lib/auth';

export type Language = 'English' | 'Hindi' | 'Marathi' | 'Gujarati' | 'Bengali' | 'Tamil' | 'Telugu';

interface AuthState {
  token: string | null;
  userId: string | null;
  householdId: string | null;
  isLoggedIn: boolean;
  isDemoMode: boolean;
  language: Language;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  voiceFabOpen: boolean;
  sidebarOpen: boolean;
  loginWithToken: (token: string, userId: string, householdId: string, familyName?: string) => void;
  loginDemo: (familyId: string) => void;
  logout: () => void;
  hydrateFromLocalAuth: () => void;
  setLanguage: (lang: Language) => void;
  toggleVoice: () => void;
  toggleNotifications: () => void;
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
      isDemoMode: false,
      language: 'English',
      voiceEnabled: true,
      notificationsEnabled: true,
      voiceFabOpen: false,
      sidebarOpen: false,

      loginWithToken: (token, userId, householdId, familyName) => {
        setAuthTokens(token, householdId, familyName);
        set({ token, userId, householdId, isLoggedIn: true, isDemoMode: false });
      },

      loginDemo: (familyId) => {
        var demoToken = `demo_${familyId}`;
        setAuthTokens(demoToken, familyId, `${familyId} Family`);
        set({
          token: demoToken,
          userId: `demo_user_${familyId}`,
          householdId: familyId,
          isLoggedIn: true,
          isDemoMode: true,
        });
      },

      logout: () => {
        clearAuthTokens();
        set({
          token: null,
          userId: null,
          householdId: null,
          isLoggedIn: false,
          isDemoMode: false,
        });
      },

      hydrateFromLocalAuth: () => {
        var auth = getAuthState();
        set({
          token: auth.token,
          userId: auth.householdId,
          householdId: auth.householdId,
          isLoggedIn: auth.isAuthenticated,
          isDemoMode: auth.token?.startsWith('demo_') || false,
        });
      },

      setLanguage: (lang) => set({ language: lang }),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
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
        isDemoMode: state.isDemoMode,
        language: state.language,
        voiceEnabled: state.voiceEnabled,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
