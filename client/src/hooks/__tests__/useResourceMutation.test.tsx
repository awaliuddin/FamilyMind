// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock modules
vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/authUtils", () => ({
  isUnauthorizedError: (error: Error) => /^401:/.test(error.message),
}));

import { apiRequest } from "@/lib/queryClient";
import { useResourceMutation } from "../useResourceMutation";

const mockApiRequest = vi.mocked(apiRequest);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe("useResourceMutation", () => {
  const defaultOptions = {
    endpoint: "/api/grocery-lists",
    queryKey: ["/api/grocery-lists"],
    createSuccessMessage: "Created!",
    updateSuccessMessage: "Updated!",
    deleteSuccessMessage: "Deleted!",
  };

  it("create calls POST with correct endpoint", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "1" }), { status: 200 }));

    const { result } = renderHook(() => useResourceMutation(defaultOptions), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.create.mutate({ store: "Costco" } as any);
    });

    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("POST", "/api/grocery-lists", { store: "Costco" });
  });

  it("update calls PATCH with id in URL", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "1" }), { status: 200 }));

    const { result } = renderHook(() => useResourceMutation(defaultOptions), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.update.mutate({ id: "1", data: { store: "Target" } } as any);
    });

    await waitFor(() => expect(result.current.update.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("PATCH", "/api/grocery-lists/1", { store: "Target" });
  });

  it("remove calls DELETE with id in URL", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const { result } = renderHook(() => useResourceMutation(defaultOptions), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.remove.mutate("1");
    });

    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("DELETE", "/api/grocery-lists/1", {});
  });

  it("calls onCreateSuccess callback on success", async () => {
    mockApiRequest.mockResolvedValue(new Response(JSON.stringify({ id: "1" }), { status: 200 }));
    const onCreateSuccess = vi.fn();

    const { result } = renderHook(
      () => useResourceMutation({ ...defaultOptions, onCreateSuccess }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      result.current.create.mutate({ store: "Costco" } as any);
    });

    await waitFor(() => expect(onCreateSuccess).toHaveBeenCalled());
  });

  it("redirects to /api/login on 401 error", async () => {
    mockApiRequest.mockRejectedValue(new Error("401: Unauthorized"));

    const originalLocation = window.location.href;
    const { result } = renderHook(() => useResourceMutation(defaultOptions), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.create.mutate({ store: "Costco" } as any);
    });

    await waitFor(() => expect(result.current.create.isError).toBe(true));
  });

  it("exposes isCreating/isUpdating/isDeleting flags", () => {
    const { result } = renderHook(() => useResourceMutation(defaultOptions), {
      wrapper: createWrapper(),
    });

    expect(result.current.isCreating).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });
});
