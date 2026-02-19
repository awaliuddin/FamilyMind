// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest, getQueryFn } from "../queryClient";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("apiRequest", () => {
  it("sends correct method and url", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

    await apiRequest("POST", "/api/grocery-lists");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/grocery-lists",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends credentials: include", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));

    await apiRequest("GET", "/api/test");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("sets Content-Type header when data is provided", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));

    await apiRequest("POST", "/api/test", { name: "test" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test" }),
      }),
    );
  });

  it("does not set Content-Type when no data", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));

    await apiRequest("GET", "/api/test");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({ headers: {} }),
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue(new Response("Not Found", { status: 404, statusText: "Not Found" }));

    await expect(apiRequest("GET", "/api/missing")).rejects.toThrow("404");
  });
});

describe("getQueryFn", () => {
  it("joins queryKey as URL and fetches", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify([{ id: 1 }]), { status: 200 }));

    const fn = getQueryFn({ on401: "throw" });
    const result = await fn({ queryKey: ["/api/grocery-lists"] } as any);

    expect(mockFetch).toHaveBeenCalledWith("/api/grocery-lists", expect.objectContaining({ credentials: "include" }));
    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns null on 401 when on401 is returnNull", async () => {
    mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    const fn = getQueryFn({ on401: "returnNull" });
    const result = await fn({ queryKey: ["/api/auth/user"] } as any);

    expect(result).toBeNull();
  });

  it("throws on 401 when on401 is throw", async () => {
    mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401, statusText: "Unauthorized" }));

    const fn = getQueryFn({ on401: "throw" });

    await expect(fn({ queryKey: ["/api/auth/user"] } as any)).rejects.toThrow("401");
  });
});
