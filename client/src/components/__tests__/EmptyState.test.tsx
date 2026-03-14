// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EmptyState } from "../shared/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">icon</span>}
        title="No items yet"
        description="Add your first item"
      />,
    );

    // getByText throws if not found — no .toBeDefined() needed
    screen.getByText("No items yet");
    screen.getByText("Add your first item");
  });

  it("renders the icon", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">icon</span>}
        title="Empty"
        description="Nothing here"
      />,
    );

    screen.getByTestId("icon");
  });

  it("renders action button when action prop is provided", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing here"
        action={{ label: "Add Item", onClick }}
      />,
    );

    const button = screen.getByText("Add Item");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not render action button when action prop is absent", () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing here"
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });
});
