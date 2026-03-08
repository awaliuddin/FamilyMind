// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock wouter
vi.mock("wouter", () => ({
  useLocation: () => ["/premium", vi.fn()],
}));

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isLoading: false, isAuthenticated: false }),
}));

// Mock apiRequest
vi.mock("@/lib/queryClient", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/queryClient")>();
  return {
    ...original,
    apiRequest: vi.fn(),
  };
});

// Mock Clerk
vi.mock("@clerk/react", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Pricing from "../pricing";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Pricing page", () => {
  it("renders Free and Premium plan cards", () => {
    renderWithProviders(<Pricing />);

    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Premium").length).toBeGreaterThan(0);
  });

  it("shows $0/month for free plan", () => {
    renderWithProviders(<Pricing />);

    expect(screen.getByText("$0")).toBeDefined();
  });

  it("shows $9.99/month for premium plan", () => {
    renderWithProviders(<Pricing />);

    expect(screen.getByText("$9.99")).toBeDefined();
  });

  it("renders Upgrade to Premium button", () => {
    renderWithProviders(<Pricing />);

    expect(screen.getByText("Upgrade to Premium")).toBeDefined();
  });

  it("shows AI assistant as premium-only feature", () => {
    renderWithProviders(<Pricing />);

    // "AI assistant" appears in the comparison table and plan card
    expect(screen.getAllByText(/AI assistant/).length).toBeGreaterThan(0);
  });

  it("shows unlimited family members as premium feature", () => {
    renderWithProviders(<Pricing />);

    expect(screen.getAllByText("Unlimited family members").length).toBeGreaterThan(0);
  });
});
