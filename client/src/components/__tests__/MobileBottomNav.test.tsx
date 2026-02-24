// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock the useIsMobile hook
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => true),
}));

import { MobileBottomNav } from "../shared/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

const mockedUseIsMobile = vi.mocked(useIsMobile);

describe("MobileBottomNav", () => {
  const onTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseIsMobile.mockReturnValue(true);
  });

  it("renders all 8 tab buttons on mobile", () => {
    render(<MobileBottomNav activeTab="dashboard" onTabChange={onTabChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(8);
  });

  it("renders nothing when not mobile", () => {
    mockedUseIsMobile.mockReturnValue(false);
    const { container } = render(
      <MobileBottomNav activeTab="dashboard" onTabChange={onTabChange} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("marks active tab with aria-current", () => {
    render(<MobileBottomNav activeTab="grocery" onTabChange={onTabChange} />);
    const groceryBtn = screen.getByLabelText("Grocery");
    expect(groceryBtn.getAttribute("aria-current")).toBe("page");
  });

  it("does not set aria-current on inactive tabs", () => {
    render(<MobileBottomNav activeTab="grocery" onTabChange={onTabChange} />);
    const calendarBtn = screen.getByLabelText("Calendar");
    expect(calendarBtn.getAttribute("aria-current")).toBeNull();
  });

  it("calls onTabChange when a tab is clicked", () => {
    render(<MobileBottomNav activeTab="dashboard" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByLabelText("Ideas"));
    expect(onTabChange).toHaveBeenCalledWith("ideas");
  });

  it("renders correct tab labels", () => {
    render(<MobileBottomNav activeTab="dashboard" onTabChange={onTabChange} />);
    const labels = ["Home", "Grocery", "Calendar", "Ideas", "Vision", "Wishlist", "Recipes", "Budget"];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("has navigation role with aria-label", () => {
    render(<MobileBottomNav activeTab="dashboard" onTabChange={onTabChange} />);
    const nav = screen.getByRole("navigation");
    expect(nav.getAttribute("aria-label")).toBe("Mobile navigation");
  });
});
