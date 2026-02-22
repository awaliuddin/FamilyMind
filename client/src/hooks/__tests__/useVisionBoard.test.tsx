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
import { useVisionItems, useVisionMutations } from "../useVisionBoard";

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

describe("useVisionItems", () => {
  it("fetches from /api/vision-items", async () => {
    const items = [
      { id: "v1", title: "Family Vacation", author: "Dad", color: "blue", progress: 0 },
    ];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(items), { status: 200 }));

    const { result } = renderHook(() => useVisionItems(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.visionItems).toEqual(items);
  });

  it("defaults to empty array", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }));

    const { result } = renderHook(() => useVisionItems(), {
      wrapper: createWrapper(),
    });

    expect(result.current.visionItems).toEqual([]);
  });
});

describe("useVisionMutations", () => {
  it("createVision calls POST /api/vision-items", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "v2" }), { status: 200 }));

    const { result } = renderHook(() => useVisionMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createVision.mutate({
        title: "New House",
        description: "Our dream home",
        author: "Mom",
        color: "green",
        icon: "home",
      });
    });

    await waitFor(() => expect(result.current.createVision.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/vision-items", {
      title: "New House",
      description: "Our dream home",
      author: "Mom",
      color: "green",
      icon: "home",
    });
  });

  it("updateVision calls PATCH /api/vision-items/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "v1" }), { status: 200 }));

    const { result } = renderHook(() => useVisionMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateVision.mutate({ id: "v1", data: { progress: 50 } });
    });

    await waitFor(() => expect(result.current.updateVision.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("PATCH", "/api/vision-items/v1", { progress: 50 });
  });

  it("deleteVision calls DELETE /api/vision-items/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useVisionMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.deleteVision.mutate("v1");
    });

    await waitFor(() => expect(result.current.deleteVision.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/vision-items/v1", {});
  });
});
