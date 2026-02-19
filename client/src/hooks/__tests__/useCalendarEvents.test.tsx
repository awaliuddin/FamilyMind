// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/lib/queryClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/queryClient")>();
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/authUtils", () => ({
  isUnauthorizedError: (error: Error) => /^401:/.test(error.message),
}));

import { apiRequest } from "@/lib/queryClient";
import { useCalendarEvents, useCalendarMutations } from "../useCalendarEvents";

const mockApiRequest = vi.mocked(apiRequest);

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        queryFn: async ({ queryKey }) => {
          const res = await fetch(queryKey.join("/"), { credentials: "include" });
          if (!res.ok) throw new Error(`${res.status}`);
          return await res.json();
        },
      },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCalendarEvents", () => {
  it("fetches from /api/calendar-events", async () => {
    const events = [{ id: "e1", title: "Soccer", eventType: "sports" }];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(events), { status: 200 }));

    const { result } = renderHook(() => useCalendarEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.calendarEvents).toEqual(events);
  });
});

describe("useCalendarMutations", () => {
  it("createEvent calls POST /api/calendar-events", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "e2" }), { status: 200 }));

    const { result } = renderHook(() => useCalendarMutations(), {
      wrapper: createWrapper(),
    });

    const eventData = {
      title: "Meeting",
      description: "Team sync",
      startTime: "2026-03-01T10:00:00Z",
      endTime: "2026-03-01T11:00:00Z",
      eventType: "work",
    };

    await act(async () => {
      result.current.createEvent.mutate(eventData);
    });

    await waitFor(() => expect(result.current.createEvent.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/calendar-events", eventData);
  });

  it("updateEvent calls PATCH with id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "e1" }), { status: 200 }));

    const { result } = renderHook(() => useCalendarMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateEvent.mutate({ id: "e1", data: { title: "Updated" } as any });
    });

    await waitFor(() => expect(result.current.updateEvent.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("PATCH", "/api/calendar-events/e1", { title: "Updated" });
  });

  it("deleteEvent calls DELETE with id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useCalendarMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.deleteEvent.mutate("e1");
    });

    await waitFor(() => expect(result.current.deleteEvent.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/calendar-events/e1", {});
  });
});
