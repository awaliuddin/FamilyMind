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
import { useGroceryLists, useGroceryMutations } from "../useGroceryLists";

const mockApiRequest = vi.mocked(apiRequest);

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createWrapper(initialData?: any) {
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
  if (initialData) {
    queryClient.setQueryData(["/api/grocery-lists"], initialData);
  }
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useGroceryLists", () => {
  it("fetches from /api/grocery-lists", async () => {
    const lists = [{ id: "l1", store: "Costco", items: [] }];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(lists), { status: 200 }));

    const { result } = renderHook(() => useGroceryLists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.groceryLists).toEqual(lists);
  });

  it("defaults to empty array", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }));

    const { result } = renderHook(() => useGroceryLists(), {
      wrapper: createWrapper(),
    });

    expect(result.current.groceryLists).toEqual([]);
  });
});

describe("useGroceryMutations", () => {
  it("createList calls POST /api/grocery-lists", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "l2" }), { status: 200 }));

    const { result } = renderHook(() => useGroceryMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createList.mutate({ store: "Aldi" });
    });

    await waitFor(() => expect(result.current.createList.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/grocery-lists", { store: "Aldi" });
  });

  it("addItem calls POST /api/grocery-items", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "i1" }), { status: 200 }));

    const { result } = renderHook(() => useGroceryMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.addItem.mutate({ listId: "l1", name: "Eggs" });
    });

    await waitFor(() => expect(result.current.addItem.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/grocery-items", { listId: "l1", name: "Eggs" });
  });

  it("updateItem triggers optimistic update via onMutate", async () => {
    const initialData = [
      {
        id: "l1",
        store: "Costco",
        items: [{ id: "i1", name: "Milk", completed: false }],
      },
    ];

    // Never resolve so we can observe the optimistic state
    let resolveRequest: () => void;
    mockApiRequest.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveRequest = () => resolve(new Response(JSON.stringify({ id: "i1", completed: true }), { status: 200 }));
      }),
    );
    // Also mock fetch for the refetch after settle
    mockFetch.mockResolvedValue(new Response(JSON.stringify(initialData), { status: 200 }));

    const wrapper = createWrapper(initialData);
    const { result } = renderHook(() => useGroceryMutations(), { wrapper });

    await act(async () => {
      result.current.updateItem.mutate({ id: "i1", data: { completed: true } });
    });

    await waitFor(() => expect(result.current.updateItem.isPending).toBe(true));

    // Resolve the request to clean up
    await act(async () => {
      resolveRequest!();
    });
  });

  it("updateItem rolls back on error", async () => {
    const initialData = [
      {
        id: "l1",
        store: "Costco",
        items: [{ id: "i1", name: "Milk", completed: false }],
      },
    ];

    mockApiRequest.mockRejectedValue(new Error("Server error"));
    mockFetch.mockResolvedValue(new Response(JSON.stringify(initialData), { status: 200 }));

    const wrapper = createWrapper(initialData);
    const { result } = renderHook(() => useGroceryMutations(), { wrapper });

    await act(async () => {
      result.current.updateItem.mutate({ id: "i1", data: { completed: true } });
    });

    await waitFor(() => expect(result.current.updateItem.isError).toBe(true));
  });
});
