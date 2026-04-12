import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHouseholds, getHousehold, updateHousehold, type Household } from '@/lib/api';

const HOUSEHOLD_KEY = 'household_id';

export function getStoredHouseholdId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(HOUSEHOLD_KEY);
}

export function setStoredHouseholdId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HOUSEHOLD_KEY, id);
}

export function clearStoredHouseholdId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HOUSEHOLD_KEY);
}

export function useHousehold() {
  const householdId = getStoredHouseholdId();

  const { data: household, isLoading, error, refetch } = useQuery<Household | null>({
    queryKey: ['household', householdId],
    queryFn: async () => {
      if (!householdId) return null;
      
      const households = await getHouseholds();
      if (households.length === 0) return null;
      
      // Find the stored household or default to first
      const found = households.find(h => h.id === householdId);
      if (found) {
        // Sync localStorage if different
        if (householdId !== found.id) {
          setStoredHouseholdId(found.id);
        }
        return found;
      }
      
      // Default to first household
      setStoredHouseholdId(households[0].id);
      return households[0];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  const { data: households = [] } = useQuery({
    queryKey: ['households'],
    queryFn: getHouseholds,
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  const selectHousehold = (id: string) => {
    setStoredHouseholdId(id);
    queryClient.invalidateQueries({ queryKey: ['household'] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Household> }) => 
      updateHousehold(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['household', householdId], updated);
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });

  return {
    household,
    households,
    isLoading,
    error,
    selectHousehold,
    updatePreferences: (prefs: Record<string, unknown>) => 
      household && updateMutation.mutate({ id: household.id, data: { preferences: prefs } }),
    refetch,
    hasHousehold: !!household,
  };
}