// API client library - connects Frontend to Backend API
// Uses standard fetch (not axios) with typed responses

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types matching Backend SQLModel/Prisma schema
export interface Household {
  id: string;
  name: string;
  username?: string;
  primary_language: string;
  village_town?: string;
  state?: string;
  district?: string;
  preferences: Record<string, any>;
  last_onboarded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Dependent {
  id: string;
  household_id: string;
  name: string;
  type: 'child' | 'adult' | 'elder' | 'pregnant';
  date_of_birth: string;
  sex: 'male' | 'female' | 'other';
  expected_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthEvent {
  id: string;
  dependent_id: string;
  household_id: string;
  name: string;
  schedule_key: string;
  category: 'vaccination' | 'checkup' | 'vitamin' | 'reminder' | 'prenatal_checkup' | 'medicine_dose' | 'growth_check';
  dose_number?: number;
  due_date: string;
  window_start?: string;
  window_end?: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  completed_at?: string;
  completed_by?: string;
  location?: string;
  notes?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verification_document_url?: string;
  verification_notes?: string;
  marked_given_at?: string;
  schedule_version: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineResponse {
  dependent_id: string;
  dependent_name: string;
  generated_at: string;
  events: HealthEvent[];
  next_due: HealthEvent | null;
}

export interface HealthPassStats {
  total_events: number;
  completed_events: number;
  overdue_count: number;
  health_score: number;
  status_color: string;
}

export interface HealthPassNextDue {
  name: string | null;
  date: string | null;
}

export interface HealthPassResponse {
  dependent: Dependent;
  stats: HealthPassStats;
  next_due: HealthPassNextDue;
}

export interface HealthScheme {
  id: string;
  name: string;
  description: string;
  benefits: string;
  eligibility_reason: string;
  category: 'maternal' | 'child' | 'general' | 'senior';
  icon: string;
}

export interface MedicineSafetyResponse {
  detected_medicine: string;
  confidence: number;
  bucket: 'common_use' | 'use_with_caution' | 'insufficient_info' | 'consult_doctor_urgently';
  concern_checked: string;
  why_caution: string;
  next_step: string;
  disclaimer: string;
  raw_ocr_text?: string;
  ocr_model_used?: string;
}

// Error handling helper
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Ensure the endpoint starts with / and we don't have double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}`;
  
  // Get token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  }).catch((error) => {
    console.error('Fetch error:', error);
    throw new ApiError(0, `Network error: ${error.message}`);
  });

  if (response.status === 401) {
    // Handle unauthorized - maybe redirect to login or clear token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('household_id');
      // Only redirect if we're not already on the login page or landing page
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json() as Promise<T>;
}

// API functions

/**
 * Fetch all households
 */
export async function getHouseholds(): Promise<Household[]> {
  return fetchApi<Household[]>('/api/v1/households');
}

/**
 * Fetch a single household by ID
 */
export async function getHousehold(id: string): Promise<Household> {
  return fetchApi<Household>(`/api/v1/households/${id}`);
}

/**
 * Update a household (settings, preferences, etc.)
 */
export async function updateHousehold(id: string, data: Partial<Household>): Promise<Household> {
  return fetchApi<Household>(`/api/v1/households/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Create a new dependent
 */
export async function createDependent(data: Omit<Dependent, 'id' | 'created_at' | 'updated_at'>): Promise<Dependent> {
  return fetchApi<Dependent>('/api/v1/dependents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Fetch dependents, optionally filtered by household ID
 */
export async function getDependents(householdId?: string): Promise<Dependent[]> {
  const params = householdId ? `?household_id=${householdId}` : '';
  return fetchApi<Dependent[]>(`/api/v1/dependents${params}`);
}

/**
 * Fetch timeline/health events for a dependent
 */
export async function getTimeline(dependentId: string, category?: string): Promise<TimelineResponse> {
  const params = category ? `?category=${category}` : '';
  return fetchApi<TimelineResponse>(`/api/v1/timeline/${dependentId}${params}`);
}

/**
 * Check medicine safety by name
 */
export async function checkMedicineByName(medicineName: string, concern?: string, language: string = 'en'): Promise<MedicineSafetyResponse> {
  return fetchApi<MedicineSafetyResponse>(`/api/v1/medicine/check-name?language=${language}`, {
    method: 'POST',
    body: JSON.stringify({ medicine_name: medicineName, concern }),
  });
}

/**
 * Check medicine safety by image upload
 */
export async function checkMedicineByImage(file: File, concern?: string, language: string = 'en'): Promise<MedicineSafetyResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (concern) formData.append('concern', concern);

  // Note: For FormData, we must NOT set Content-Type header manually as the browser needs to set boundaries
  const url = `${API_URL}/api/v1/medicine/check-image?language=${language}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<MedicineSafetyResponse>;
}

/**
 * Fetch health pass for a dependent
 */
export async function getHealthPass(dependentId: string): Promise<HealthPassResponse> {
  return fetchApi<HealthPassResponse>(`/api/v1/dependents/${dependentId}/pass`);
}

export async function getRecommendedSchemes(householdId: string): Promise<HealthScheme[]> {
  return fetchApi<HealthScheme[]>(`/api/v1/households/${householdId}/schemes`);
}

// Pregnancy Profile Types and Functions
export interface PregnancyProfile {
  id: string;
  household_id: string;
  lmp_date: string;
  expected_due_date: string;
  high_risk_flags: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  pregnancy_week?: number;
  trimester?: number;
  days_until_due?: number;
}

export async function createPregnancy(data: { household_id: string; lmp_date: string; high_risk_flags?: string }): Promise<PregnancyProfile> {
  return fetchApi<PregnancyProfile>('/api/v1/pregnancy', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPregnancy(householdId: string): Promise<PregnancyProfile | null> {
  try {
    return await fetchApi<PregnancyProfile>(`/api/v1/pregnancy/${householdId}`);
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function updatePregnancy(householdId: string, data: Partial<PregnancyProfile>): Promise<PregnancyProfile> {
  return fetchApi<PregnancyProfile>(`/api/v1/pregnancy/${householdId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Medicine Regimen Types and Functions
export type FrequencyType = 'daily' | 'twice_daily' | 'three_daily' | 'weekly' | 'as_needed';

export interface MedicineRegimen {
  id: string;
  dependent_id: string;
  medicine_name: string;
  dosage: string;
  frequency: FrequencyType;
  start_date: string;
  end_date?: string;
  safety_bucket: string;
  prescribing_note: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function createMedicineRegimen(data: {
  dependent_id: string;
  household_id: string;
  medicine_name: string;
  dosage: string;
  frequency: FrequencyType;
  start_date: string;
  end_date?: string;
  prescribing_note?: string;
}): Promise<MedicineRegimen> {
  return fetchApi<MedicineRegimen>('/api/v1/medicines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMedicineRegimens(dependentId: string): Promise<MedicineRegimen[]> {
  return fetchApi<MedicineRegimen[]>(`/api/v1/medicines/${dependentId}`);
}

export async function updateMedicineRegimen(regimenId: string, data: Partial<MedicineRegimen>): Promise<MedicineRegimen> {
  return fetchApi<MedicineRegimen>(`/api/v1/medicines/${regimenId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deactivateMedicineRegimen(regimenId: string): Promise<void> {
  return fetchApi<void>(`/api/v1/medicines/${regimenId}`, {
    method: 'DELETE',
  });
}

// Growth Record Types and Functions
export interface GrowthRecord {
  id: string;
  dependent_id: string;
  recorded_date: string;
  height_cm?: number;
  weight_kg?: number;
  head_circumference_cm?: number;
  milestone_achieved?: string;
  notes: string;
  created_at: string;
}

export async function createGrowthRecord(dependentId: string, data: {
  recorded_date: string;
  height_cm?: number;
  weight_kg?: number;
  head_circumference_cm?: number;
  milestone_achieved?: string;
  notes?: string;
}): Promise<GrowthRecord> {
  return fetchApi<GrowthRecord>(`/api/v1/growth/${dependentId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getGrowthRecords(dependentId: string): Promise<GrowthRecord[]> {
  return fetchApi<GrowthRecord[]>(`/api/v1/growth/${dependentId}`);
}

export async function markEventComplete(dependentId: string, eventId: string, notes?: string): Promise<HealthEvent> {
  return fetchApi<HealthEvent>(`/api/v1/timeline/${dependentId}/events/${eventId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({
      completed_by: 'Parent',
      location: 'Health Center',
      notes: notes
    }),
  });
}

export async function createHealthEvent(dependentId: string, event: Partial<HealthEvent>): Promise<HealthEvent> {
  return fetchApi<HealthEvent>(`/api/v1/timeline/${dependentId}/events`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

import { supabase } from './supabase';

export const authApi = {
  async login(emailOrUsername: string, password: string): Promise<{ access_token: string; token_type: string; household_id: string }> {
    // If it's a simple username (no @), we might need to append the demo domain 
    // or handle it according to how they were seeded.
    const email = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@wellsync.demo`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiError(401, error.message);
    }

    if (!data.session) {
      throw new ApiError(401, 'Session not created');
    }

    return {
      access_token: data.session.access_token,
      token_type: 'bearer',
      household_id: data.user.id,
    };
  },

  async signup(payload: {
    name: string;
    username: string;
    password: string;
    primary_language?: string;
  }): Promise<Household> {
    const email = payload.username.includes('@') ? payload.username : `${payload.username}@wellsync.demo`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          username: payload.username,
          primary_language: payload.primary_language ?? 'en',
        }
      }
    });

    if (error) {
      throw new ApiError(400, error.message);
    }

    if (!data.user) {
      throw new ApiError(400, 'User creation failed');
    }

    // Since the trigger handles household creation, we return a partial household
    // The actual household will be fetched by the dashboard.
    return {
      id: data.user.id,
      name: payload.name,
      username: payload.username,
      primary_language: payload.primary_language ?? 'en',
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Household;
  },
};

export function toLanguageCode(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (normalized === 'hindi') return 'hi';
  if (normalized === 'marathi') return 'mr';
  if (normalized === 'gujarati') return 'gu';
  if (normalized === 'bengali') return 'bn';
  if (normalized === 'tamil') return 'ta';
  if (normalized === 'telugu') return 'te';
  return 'en';
}