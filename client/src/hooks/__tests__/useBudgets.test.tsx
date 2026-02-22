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
import { useBudgets, useBudgetMutations } from "../useBudgets";

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

describe("useBudgets", () => {
  it("fetches from /api/budgets", async () => {
    const budgets = [
      { id: "b1", name: "Groceries", amount: "500", expenses: [] },
    ];
    mockFetch.mockResolvedValue(new Response(JSON.stringify(budgets), { status: 200 }));

    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.budgets).toEqual(budgets);
  });

  it("defaults to empty array", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }));

    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper(),
    });

    expect(result.current.budgets).toEqual([]);
  });
});

describe("useBudgetMutations", () => {
  it("createBudget calls POST /api/budgets", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "b2" }), { status: 200 }));

    const { result } = renderHook(() => useBudgetMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createBudget.mutate({
        name: "Dining",
        amount: "200",
        category: "dining",
      });
    });

    await waitFor(() => expect(result.current.createBudget.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/budgets", {
      name: "Dining",
      amount: "200",
      category: "dining",
    });
  });

  it("updateBudget calls PATCH /api/budgets/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "b1" }), { status: 200 }));

    const { result } = renderHook(() => useBudgetMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.updateBudget.mutate({ id: "b1", data: { amount: "600" } });
    });

    await waitFor(() => expect(result.current.updateBudget.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("PATCH", "/api/budgets/b1", { amount: "600" });
  });

  it("deleteBudget calls DELETE /api/budgets/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useBudgetMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.deleteBudget.mutate("b1");
    });

    await waitFor(() => expect(result.current.deleteBudget.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/budgets/b1", {});
  });

  it("createExpense calls POST /api/expenses", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "e1" }), { status: 200 }));

    const { result } = renderHook(() => useBudgetMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.createExpense.mutate({
        budgetId: "b1",
        amount: "45.50",
        description: "Costco",
        date: "2026-02-20",
      });
    });

    await waitFor(() => expect(result.current.createExpense.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/expenses", {
      budgetId: "b1",
      amount: "45.50",
      description: "Costco",
      date: "2026-02-20",
    });
  });

  it("deleteExpense calls DELETE /api/expenses/:id", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useBudgetMutations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.deleteExpense.mutate("e1");
    });

    await waitFor(() => expect(result.current.deleteExpense.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/expenses/e1", {});
  });
});
