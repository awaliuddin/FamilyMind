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
import { useFamilyIdeas, useFamilyIdeaMutations } from "../useFamilyIdeas";

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

describe("useFamilyIdeas", () => {
  it("fetches from /api/family-ideas", async () => {
    const ideas = [
      { id: "idea-1", title: "Disney trip", author: "Mom", likes: 3, userLiked: false },
    ];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(ideas), { status: 200 }));

    const { result } = renderHook(() => useFamilyIdeas(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.familyIdeas).toEqual(ideas);
  });

  it("defaults to empty array", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }));

    const { result } = renderHook(() => useFamilyIdeas(), {
      wrapper: createWrapper(),
    });

    expect(result.current.familyIdeas).toEqual([]);
  });
});

describe("useFamilyIdeaMutations", () => {
  it("createIdea calls POST /api/family-ideas", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "idea-2" }), { status: 200 }));

    const { result } = renderHook(() => useFamilyIdeaMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createIdea.mutate({ title: "Game night", author: "Dad" });
    });

    await waitFor(() => expect(result.current.createIdea.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/family-ideas", {
      title: "Game night",
      author: "Dad",
    });
  });

  it("likeIdea calls POST /api/family-ideas/:id/like", async () => {
    // likeIdea uses optimistic update via onMutate, which reads/sets query data.
    // Seed the query cache with initial ideas so the optimistic update can run.
    const ideas = [
      { id: "idea-1", title: "Disney trip", author: "Mom", likes: 2, userLiked: false },
    ];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(ideas), { status: 200 }));
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const wrapper = createWrapper();
    // First render the query hook to seed data
    const { result: queryResult } = renderHook(() => useFamilyIdeas(), { wrapper });
    await waitFor(() => expect(queryResult.current.isLoading).toBe(false));

    // Now test the mutation
    const { result } = renderHook(() => useFamilyIdeaMutations(), { wrapper });

    await act(async () => {
      result.current.likeIdea.mutate("idea-1");
    });

    await waitFor(() => expect(result.current.likeIdea.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/family-ideas/idea-1/like", {});
  });

  it("handles isLoading state during mutation", () => {
    const { result } = renderHook(() => useFamilyIdeaMutations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.createIdea.isPending).toBe(false);
    expect(result.current.likeIdea.isPending).toBe(false);
  });
});
