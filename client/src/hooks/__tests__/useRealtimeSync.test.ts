// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockInvalidateQueries = vi.fn();

vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: mockInvalidateQueries,
  },
}));

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onmessage: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn(() => {
    this.onclose?.();
  });

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useRealtimeSync", () => {
  it("connects to WebSocket on mount", async () => {
    const { useRealtimeSync } = await import("../useRealtimeSync");
    renderHook(() => useRealtimeSync());

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toContain("/ws");
  });

  it("invalidates queries when receiving invalidate message", async () => {
    const { useRealtimeSync } = await import("../useRealtimeSync");
    renderHook(() => useRealtimeSync());

    const ws = MockWebSocket.instances[0];
    ws.onmessage?.({ data: JSON.stringify({ type: "invalidate", queryKey: "/api/grocery-lists" }) });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["/api/grocery-lists"] });
  });

  it("ignores malformed messages", async () => {
    const { useRealtimeSync } = await import("../useRealtimeSync");
    renderHook(() => useRealtimeSync());

    const ws = MockWebSocket.instances[0];
    ws.onmessage?.({ data: "not json" });

    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("ignores non-invalidate messages", async () => {
    const { useRealtimeSync } = await import("../useRealtimeSync");
    renderHook(() => useRealtimeSync());

    const ws = MockWebSocket.instances[0];
    ws.onmessage?.({ data: JSON.stringify({ type: "ping" }) });

    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("reconnects after close with 3s delay", async () => {
    const { useRealtimeSync } = await import("../useRealtimeSync");
    renderHook(() => useRealtimeSync());

    expect(MockWebSocket.instances).toHaveLength(1);

    // Simulate close without calling ws.close() (which would trigger our mock)
    // Instead, directly invoke onclose to simulate server-side close
    const ws = MockWebSocket.instances[0];
    ws.onclose?.();

    // Not reconnected yet
    expect(MockWebSocket.instances).toHaveLength(1);

    // Advance timer by 3s
    vi.advanceTimersByTime(3000);

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("closes WebSocket on unmount", async () => {
    const { useRealtimeSync } = await import("../useRealtimeSync");
    const { unmount } = renderHook(() => useRealtimeSync());

    const ws = MockWebSocket.instances[0];
    unmount();

    expect(ws.close).toHaveBeenCalled();
  });
});
