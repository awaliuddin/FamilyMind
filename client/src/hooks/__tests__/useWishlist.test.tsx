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
import { useWishlistItems, useWishlistMutations } from "../useWishlist";

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

describe("useWishlistItems", () => {
  it("fetches from /api/wishlist-items", async () => {
    const items = [
      { id: "w1", item: "Lego Set", person: "Kid", occasion: "Birthday" },
    ];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(items), { status: 200 }));

    const { result } = renderHook(() => useWishlistItems(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.wishlistItems).toEqual(items);
  });

  it("defaults to empty array", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }));

    const { result } = renderHook(() => useWishlistItems(), {
      wrapper: createWrapper(),
    });

    expect(result.current.wishlistItems).toEqual([]);
  });
});

describe("useWishlistMutations", () => {
  it("createWishlistItem calls POST /api/wishlist-items", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "w2" }), { status: 200 }));

    const { result } = renderHook(() => useWishlistMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createWishlistItem.mutate({
        item: "Book",
        person: "Mom",
        occasion: "Christmas",
        store: "Amazon",
      });
    });

    await waitFor(() => expect(result.current.createWishlistItem.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/wishlist-items", {
      item: "Book",
      person: "Mom",
      occasion: "Christmas",
      store: "Amazon",
    });
  });

  it("updateWishlistItem calls PATCH /api/wishlist-items/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "w1" }), { status: 200 }));

    const { result } = renderHook(() => useWishlistMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateWishlistItem.mutate({ id: "w1", data: { purchased: true } });
    });

    await waitFor(() => expect(result.current.updateWishlistItem.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("PATCH", "/api/wishlist-items/w1", { purchased: true });
  });

  it("deleteWishlistItem calls DELETE /api/wishlist-items/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useWishlistMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.deleteWishlistItem.mutate("w1");
    });

    await waitFor(() => expect(result.current.deleteWishlistItem.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/wishlist-items/w1", {});
  });
});
