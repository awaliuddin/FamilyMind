// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { UpgradePrompt } from "../UpgradePrompt";

const mockNavigate = vi.fn();
vi.mock("wouter", () => ({
  useLocation: () => ["/", mockNavigate],
}));

describe("UpgradePrompt", () => {
  it("renders the upgrade message", () => {
    render(<UpgradePrompt message="Upgrade to unlock AI features" />);

    expect(screen.getByText("Upgrade to unlock AI features")).toBeDefined();
  });

  it("renders a link to premium plans", () => {
    render(<UpgradePrompt message="Need more members?" />);

    expect(screen.getByText("View Premium plans")).toBeDefined();
  });

  it("navigates to /premium when clicked", () => {
    render(<UpgradePrompt message="Upgrade now" />);

    fireEvent.click(screen.getByText("View Premium plans"));
    expect(mockNavigate).toHaveBeenCalledWith("/premium");
  });
});
