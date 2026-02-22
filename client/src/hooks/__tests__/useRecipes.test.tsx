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
import { useRecipes, useRecipeMutations } from "../useRecipes";

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

describe("useRecipes", () => {
  it("fetches from /api/recipes", async () => {
    const recipes = [
      { id: "r1", title: "Pasta", ingredients: [], category: "dinner" },
    ];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(recipes), { status: 200 }));

    const { result } = renderHook(() => useRecipes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recipes).toEqual(recipes);
  });

  it("defaults to empty array", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }));

    const { result } = renderHook(() => useRecipes(), {
      wrapper: createWrapper(),
    });

    expect(result.current.recipes).toEqual([]);
  });
});

describe("useRecipeMutations", () => {
  it("createRecipe calls POST /api/recipes", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "r2" }), { status: 200 }));

    const { result } = renderHook(() => useRecipeMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createRecipe.mutate({
        title: "Tacos",
        ingredients: [{ name: "tortillas", quantity: "8", unit: "pcs" }],
      });
    });

    await waitFor(() => expect(result.current.createRecipe.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/recipes", {
      title: "Tacos",
      ingredients: [{ name: "tortillas", quantity: "8", unit: "pcs" }],
    });
  });

  it("updateRecipe calls PATCH /api/recipes/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "r1" }), { status: 200 }));

    const { result } = renderHook(() => useRecipeMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateRecipe.mutate({ id: "r1", data: { title: "Updated Pasta" } });
    });

    await waitFor(() => expect(result.current.updateRecipe.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("PATCH", "/api/recipes/r1", { title: "Updated Pasta" });
  });

  it("deleteRecipe calls DELETE /api/recipes/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useRecipeMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.deleteRecipe.mutate("r1");
    });

    await waitFor(() => expect(result.current.deleteRecipe.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/recipes/r1", {});
  });

  it("addToGroceryList calls POST /api/recipes/:id/to-grocery-list", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ added: 3 }), { status: 200 }));

    const { result } = renderHook(() => useRecipeMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.addToGroceryList.mutate({ recipeId: "r1", listId: "l1" });
    });

    await waitFor(() => expect(result.current.addToGroceryList.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/recipes/r1/to-grocery-list", { listId: "l1" });
  });
});
