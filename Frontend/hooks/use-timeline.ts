'use client';

import { useQuery } from '@tanstack/react-query';
import { getTimeline, type TimelineResponse, type HealthEvent } from '@/lib/api';
import { useState, useMemo } from 'react';

const TIMELINE_KEY = 'timeline';

export interface TimelineFilters {
  category?: string;
  status?: 'upcoming' | 'due' | 'overdue' | 'completed';
  sortBy?: 'date' | 'status';
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export function useTimeline(dependentId: string | null, filters?: TimelineFilters) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
  });

  // Fetch timeline data
  const { data: timelineData, isLoading, error, refetch } = useQuery({
    queryKey: [TIMELINE_KEY, dependentId, filters?.category],
    queryFn: () => {
      if (!dependentId) return null;
      return getTimeline(dependentId, filters?.category);
    },
    enabled: !!dependentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Apply client-side filtering and pagination
  const processedEvents = useMemo(() => {
    if (!timelineData?.events) return [];

    let events = [...timelineData.events];

    // Filter by status if specified
    if (filters?.status) {
      events = events.filter((e) => e.status === filters.status);
    }

    // Sort events
    if (filters?.sortBy === 'status') {
      const statusOrder = { overdue: 0, due: 1, upcoming: 2, completed: 3 };
      events.sort(
        (a, b) =>
          (statusOrder[a.status as keyof typeof statusOrder] || 999) -
          (statusOrder[b.status as keyof typeof statusOrder] || 999)
      );
    } else {
      // Default: sort by due_date
      events.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    }

    return events;
  }, [timelineData?.events, filters?.status, filters?.sortBy]);

  // Paginate events
  const paginatedEvents = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedEvents.slice(start, end);
  }, [processedEvents, pagination.page, pagination.pageSize]);

  const totalPages = Math.ceil(processedEvents.length / pagination.pageSize);

  const goToPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, totalPages)),
    }));
  };

  const nextPage = () => goToPage(pagination.page + 1);
  const prevPage = () => goToPage(pagination.page - 1);

  return {
    events: paginatedEvents,
    allEvents: processedEvents,
    timelineData,
    isLoading,
    error,
    refetch,
    pagination: {
      ...pagination,
      totalPages,
      totalEvents: processedEvents.length,
      goToPage,
      nextPage,
      prevPage,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };
}

/**
 * Hook to get health event statistics
 */
export function useTimelineStats(dependentId: string | null) {
  const { allEvents } = useTimeline(dependentId);

  const stats = useMemo(() => {
    const total = allEvents.length;
    const completed = allEvents.filter((e) => e.status === 'completed').length;
    const overdue = allEvents.filter((e) => e.status === 'overdue').length;
    const due = allEvents.filter((e) => e.status === 'due').length;
    const upcoming = allEvents.filter((e) => e.status === 'upcoming').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const healthScore = Math.max(0, 100 - overdue * 10 - due * 5 + completed * 2);

    return {
      total,
      completed,
      overdue,
      due,
      upcoming,
      completionRate,
      healthScore: Math.min(100, Math.max(0, healthScore)),
    };
  }, [allEvents]);

  return stats;
}
