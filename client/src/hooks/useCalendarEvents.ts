import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CalendarEvent } from "@shared/schema";

const QUERY_KEY = ['/api/calendar-events'];

export function useCalendarEvents() {
  const { data = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: QUERY_KEY,
    retry: false,
  });

  return { calendarEvents: data, isLoading };
}

export function useCalendarMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUnauthorizedError = (error: Error) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return true;
    }
    return false;
  };

  const createEvent = useMutation({
    mutationFn: async (event: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      location?: string;
      eventType: string;
      color?: string;
    }) => {
      const response = await apiRequest('POST', '/api/calendar-events', event);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Calendar event created successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => {
      const response = await apiRequest('PATCH', `/api/calendar-events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Event updated successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/calendar-events/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Event deleted successfully!" });
    },
    onError: handleUnauthorizedError,
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
