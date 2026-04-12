'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthState, isTokenExpired, getToken } from '@/lib/auth';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if not authenticated
 */
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const { isAuthenticated, token } = getAuthState();

      // Check if token is expired
      if (token && isTokenExpired(token)) {
        // Token expired, clear and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('household_id');
        router.push('/login?expired=true');
        setIsLoading(false);
        return;
      }

      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        router.push('/login');
        setIsLoading(false);
        return;
      }

      setIsAuthed(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  return { isLoading, isAuthed };
}

/**
 * Hook to check if user is authenticated without redirecting
 */
export function useIsAuthenticated() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { isAuthenticated, token } = getAuthState();

    if (token && isTokenExpired(token)) {
      setIsAuthed(false);
    } else {
      setIsAuthed(isAuthenticated);
    }

    setIsLoading(false);
  }, []);

  return { isAuthed, isLoading };
}

/**
 * Hook to handle logout
 */
export function useLogout() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('household_id');
    localStorage.removeItem('family_name');
    router.push('/login');
  };

  return { logout };
}
