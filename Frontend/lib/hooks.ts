import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkMedicineByImage,
  createDependent,
  createGrowthRecord,
  createMedicineRegimen,
  createPregnancy,
  getDependents,
  getGrowthRecords,
  getHealthPass,
  getHousehold,
  getHouseholds,
  getMedicineRegimens,
  getRecommendedSchemes,
  getTimeline,
  markEventComplete,
  createHealthEvent,
  type Dependent,
  type HealthEvent,
  type Household,
} from './api';
import { useAuthStore } from './auth-store';
import { demoFamilies } from './data';

function getDemoFamily() {
  var hid = useAuthStore.getState().householdId;
  return demoFamilies.find((f: any) => f.id === hid) || demoFamilies[0];
}

function mapTypeToRelation(type: string) {
  if (type === 'child') return 'child';
  if (type === 'pregnant') return 'mother';
  if (type === 'elder') return 'elder';
  return 'member';
}

function avatarForRelation(relation: string) {
  if (relation === 'child') return '👶';
  if (relation === 'mother') return '🤰';
  if (relation === 'elder') return '🧓';
  return '👤';
}

export function useHousehold() {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useQuery({
    queryKey: ['household', householdId],
    queryFn: async () => {
      if (isDemoMode) {
        var fam = getDemoFamily();
        return { id: fam.id, family_name: fam.name, language: fam.language } as any;
      }

      if (householdId) {
        try {
          return (await getHousehold(householdId)) as any;
        } catch {
          // fall back below
        }
      }

      var households = await getHouseholds();
      return (households[0] as any) || null;
    },
    enabled: !!householdId || isDemoMode,
  });
}

export function useSchemes() {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useQuery({
    queryKey: ['schemes', householdId],
    queryFn: async () => {
      if (isDemoMode) {
        return getDemoFamily().schemes || [];
      }
      if (!householdId) return [];
      return getRecommendedSchemes(householdId) || null;
    },
    enabled: !!householdId || isDemoMode,
  });
}

export function useDependents() {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useQuery({
    queryKey: ['dependents', householdId],
    queryFn: async () => {
      if (isDemoMode) {
        return getDemoFamily().dependents.map((d: any) => ({
          id: d.id,
          name: d.name,
          relation: d.relation,
          dob: d.dob,
          gender: d.gender,
          avatar: d.avatar,
          pregnancy_week: d.pregnancyWeek,
          edd: d.edd,
          high_risk_flags: d.highRiskFlags,
        }));
      }

      var deps = await getDependents(householdId || undefined);
      return deps.map((d: Dependent) => ({
        id: d.id,
        name: d.name,
        relation: mapTypeToRelation(d.type),
        dob: d.date_of_birth,
        gender: d.sex,
        avatar: avatarForRelation(mapTypeToRelation(d.type)),
        pregnancy_week: undefined,
        edd: d.expected_delivery_date,
        high_risk_flags: undefined,
      }));
    },
    enabled: !!householdId,
  });
}

export function useCreateDependent() {
  var qc = useQueryClient();
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useMutation({
    mutationFn: async (data: { name: string; relation: string; dob: string; gender: string }) => {
      if (isDemoMode) {
        return {
          id: `dep_${Date.now()}`,
          name: data.name,
          relation: data.relation,
          dob: data.dob,
          gender: data.gender,
          avatar: avatarForRelation(data.relation),
        };
      }

      return createDependent({
        household_id: householdId || '',
        name: data.name,
        type: data.relation === 'mother' ? 'pregnant' : (data.relation as any) || 'child',
        date_of_birth: data.dob,
        sex: (data.gender as any) || 'other',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dependents', householdId] });
    },
  });
}

function mapEventCategory(cat: string) {
  if (cat === 'vaccination') return 'vaccine';
  if (cat === 'medicine_dose') return 'medicine';
  if (cat === 'growth_check') return 'growth';
  if (cat === 'prenatal_checkup') return 'pregnancy';
  return 'checkup';
}

function mapEventTitle(e: HealthEvent) {
  return e.name || e.schedule_key || 'Health Event';
}

export function useTimeline(depId: string | undefined) {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);

  return useQuery({
    queryKey: ['timeline', depId],
    enabled: !!depId,
    queryFn: async () => {
      if (!depId) return [];
      if (isDemoMode) {
        var dep = getDemoFamily().dependents.find((d: any) => d.id === depId);
        return (dep?.timeline || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.date,
          category: e.category,
          status: e.status,
          ai_explanation: e.aiExplanation,
        }));
      }

      var timeline = await getTimeline(depId);
      return (timeline.events || []).map((e: HealthEvent) => ({
        id: e.id,
        title: mapEventTitle(e),
        description: e.notes || e.schedule_key || 'Scheduled health action',
        date: e.due_date,
        category: mapEventCategory(e.category),
        status: e.status,
        ai_explanation: undefined,
      }));
    },
  });
}

export function useAllTimelines() {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useQuery({
    queryKey: ['all-timelines', householdId],
    queryFn: async () => {
      if (isDemoMode) {
        var fam = getDemoFamily();
        return fam.dependents.flatMap((d: any) =>
          d.timeline.map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            date: e.date,
            category: e.category,
            status: e.status,
            ai_explanation: e.aiExplanation,
            dep_name: d.name,
            dep_avatar: d.avatar,
            dep_id: d.id,
          }))
        );
      }

      var deps = await getDependents(householdId || undefined);
      var chunks = await Promise.all(
        deps.map(async (d: Dependent) => {
          var t = await getTimeline(d.id);
          return (t.events || []).map((e: HealthEvent) => ({
            id: e.id,
            title: mapEventTitle(e),
            description: e.notes || e.schedule_key || 'Scheduled health action',
            date: e.due_date,
            category: mapEventCategory(e.category),
            status: e.status,
            ai_explanation: undefined,
            dep_name: d.name,
            dep_avatar: avatarForRelation(mapTypeToRelation(d.type)),
            dep_id: d.id,
          }));
        })
      );
      return chunks.flat();
    },
    enabled: !!householdId,
  });
}

export function useCompleteEvent() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ depId, eventId }: { depId: string; eventId: string }) => {
      return markEventComplete(depId, eventId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['timeline', vars.depId] });
      qc.invalidateQueries({ queryKey: ['all-timelines'] });
    },
  });
}

export function useCreateEvent() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ depId, event }: { depId: string; event: Partial<HealthEvent> }) => {
      return createHealthEvent(depId, event);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['timeline', vars.depId] });
      qc.invalidateQueries({ queryKey: ['all-timelines'] });
    },
  });
}

export function useMedicines(depId?: string) {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useQuery({
    queryKey: ['medicines', depId || 'all', householdId],
    queryFn: async () => {
      if (isDemoMode) {
        var meds = getDemoFamily().medicines || [];
        var filtered = depId ? meds.filter((m: any) => m.forDependent === depId) : meds;
        return filtered.map((m: any) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          for_dependent: m.forDependent,
          safety: m.safety,
          active: m.active,
          start_date: m.startDate,
          end_date: m.endDate,
          doses_taken: m.dosesTaken,
          total_doses: m.totalDoses,
        }));
      }

      var deps = await getDependents(householdId || undefined);
      var targetDeps = depId ? deps.filter((d) => d.id === depId) : deps;
      var chunks = await Promise.all(targetDeps.map((d) => getMedicineRegimens(d.id)));
      return chunks.flat().map((m: any) => ({
        id: m.id,
        name: m.medicine_name,
        dosage: m.dosage,
        frequency: m.frequency,
        for_dependent: m.dependent_id,
        safety: m.safety_bucket,
        active: m.active,
        start_date: m.start_date,
        end_date: m.end_date,
        doses_taken: 0,
        total_doses: 0,
      }));
    },
    enabled: !!householdId,
  });
}

export function useScanMedicine() {
  return useMutation({
    mutationFn: async (file: File) => {
      var result = await checkMedicineByImage(file);
      return {
        name: result.detected_medicine,
        dosage: 'As prescribed',
        frequency: 'As directed',
        safety: result.bucket === 'consult_doctor_urgently' ? 'avoid' : result.bucket === 'use_with_caution' ? 'caution' : 'safe',
      };
    },
  });
}

export function useCreateMedicine() {
  var qc = useQueryClient();
  var householdId = useAuthStore((s) => s.householdId);

  return useMutation({
    mutationFn: async ({ depId, data }: { depId: string; data: any }) => {
      return createMedicineRegimen({
        dependent_id: depId,
        household_id: householdId || '',
        medicine_name: data.name,
        dosage: data.dosage,
        frequency: data.frequency || 'daily',
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date,
        prescribing_note: data.prescribing_note,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}

export function usePregnancy() {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  var householdId = useAuthStore((s) => s.householdId);

  return useQuery({
    queryKey: ['pregnancy', householdId],
    queryFn: async () => {
      if (isDemoMode) {
        var dep = getDemoFamily().dependents.find((d: any) => d.pregnancyWeek);
        if (!dep) return null;
        var week = dep.pregnancyWeek || 0;
        return {
          dependent_id: dep.id,
          dependent_name: dep.name,
          pregnancy_week: week,
          edd: dep.edd || '',
          trimester: week <= 12 ? 1 : week <= 27 ? 2 : 3,
          high_risk_flags: dep.highRiskFlags || [],
          milestones: [
            { week: 8, label: 'First ultrasound', done: week >= 8 },
            { week: 12, label: 'NT scan & blood tests', done: week >= 12 },
            { week: 20, label: 'Detailed anatomy scan', done: week >= 20 },
            { week: 24, label: 'Glucose tolerance test', done: week >= 24 },
            { week: 28, label: 'Anti-D injection (if needed)', done: week >= 28 },
            { week: 32, label: 'Growth scan', done: week >= 32 },
            { week: 36, label: 'Weekly checkups begin', done: week >= 36 },
            { week: 40, label: 'Expected delivery', done: week >= 40 },
          ],
        };
      }
      if (!householdId) return null;
      return null;
    },
  });
}

export function useGrowthRecords(depId: string | undefined) {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ['growth', depId],
    enabled: !!depId,
    queryFn: async () => {
      if (!depId) return [];
      if (isDemoMode) {
        var dep = getDemoFamily().dependents.find((d: any) => d.id === depId);
        return dep?.growthRecords || [];
      }
      var records = await getGrowthRecords(depId);
      return records.map((r: any) => ({
        id: r.id,
        date: r.recorded_date,
        height: r.height_cm,
        weight: r.weight_kg,
        milestone: r.milestone_achieved,
      }));
    },
  });
}

export function useAddGrowthRecord() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: ({ depId, data }: { depId: string; data: { height: number; weight: number; milestone?: string } }) =>
      createGrowthRecord(depId, {
        recorded_date: new Date().toISOString().split('T')[0],
        height_cm: data.height,
        weight_kg: data.weight,
        milestone_achieved: data.milestone,
      }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['growth', vars.depId] }),
  });
}

export function useReminders() {
  var isDemoMode = useAuthStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (isDemoMode) {
        return (getDemoFamily().reminders || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          time: r.time,
          for_dependent: r.forDependent,
          done: r.done,
          category: r.category,
        }));
      }
      return [];
    },
  });
}

export function useCreateReminder() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => ({ id: `rem_${Date.now()}`, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useToggleReminder() {
  var qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => ({ id, done: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useVoiceQuery() {
  return useMutation({
    mutationFn: async (text: string) => {
      return {
        answer: `I heard: ${text}`,
      };
    },
  });
}
