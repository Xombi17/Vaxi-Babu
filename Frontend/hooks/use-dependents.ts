'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createDependent, getDependents, type Dependent } from '@/lib/api';
import { getHouseholdId } from '@/lib/auth';

const DEPENDENTS_KEY = 'dependents';

export function useDependents() {
  const householdId = getHouseholdId();
  const queryClient = useQueryClient();

  // Fetch all dependents for the household
  const { data: dependents = [], isLoading, error, refetch } = useQuery({
    queryKey: [DEPENDENTS_KEY, householdId],
    queryFn: () => getDependents(householdId || undefined),
    enabled: !!householdId,
    staleTime: 5 * 60 * 1000,
  });

  // Create dependent mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Dependent, 'id' | 'created_at' | 'updated_at'>) =>
      createDependent(data),
    onSuccess: (newDependent) => {
      // Update cache with new dependent
      queryClient.setQueryData([DEPENDENTS_KEY, householdId], (old: Dependent[] = []) => [
        ...old,
        newDependent,
      ]);
    },
    onError: (error: any) => {
      console.error('Failed to create dependent:', error);
    },
  });

  const addDependent = async (data: {
    name: string;
    type: 'child' | 'adult' | 'elder' | 'pregnant';
    sex: 'male' | 'female' | 'other';
    date_of_birth?: string;
    expected_delivery_date?: string;
    notes?: string;
  }) => {
    if (!householdId) {
      throw new Error('No household found');
    }

    return createMutation.mutateAsync({
      household_id: householdId,
      name: data.name,
      type: data.type,
      sex: data.sex,
      date_of_birth: data.date_of_birth || new Date().toISOString().split('T')[0],
      expected_delivery_date: data.expected_delivery_date,
      notes: data.notes,
    });
  };

  return {
    dependents,
    isLoading,
    error,
    refetch,
    addDependent,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
