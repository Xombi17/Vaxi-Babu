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
  category: 'vaccination' | 'checkup' | 'vitamin' | 'reminder';
  dose_number?: number;
  due_date: string;
  window_start?: string;
  window_end?: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  completed_at?: string;
  completed_by?: string;
  location?: string;
  notes?: string;
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
  const isGet = !options || !options.method || options.method === 'GET';
  
  // Get token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const cacheKey = `api_cache_${url}_${token || 'guest'}`;

  // Check cache for GET requests
  if (isGet && typeof window !== 'undefined') {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
          return parsed.data as T;
        }
      } catch (e) {
        // Invalid JSON, safe to ignore and refetch
      }
    }
  }

  // If not GET, clear all local API caches to prevent stale data
  if (!isGet && typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('api_cache_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  }
  
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
    throw new ApiError(
      response.status,
      `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json() as Promise<T>;

  // Save to cache for GET requests
  if (isGet && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      // Safe to ignore quota exceeded errors
    }
  }

  return data;
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
export async function getTimeline(dependentId: string): Promise<TimelineResponse> {
  return fetchApi<TimelineResponse>(`/api/v1/timeline/${dependentId}`);
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