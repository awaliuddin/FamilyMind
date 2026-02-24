// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import {
  GroceryListSkeleton,
  CalendarEventSkeleton,
  IdeaCardSkeleton,
  VisionCardSkeleton,
  WishlistCardSkeleton,
  DashboardStatSkeleton,
} from "../shared/SkeletonLoaders";

describe("SkeletonLoaders", () => {
  it("renders GroceryListSkeleton without errors", () => {
    const { container } = render(<GroceryListSkeleton />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders CalendarEventSkeleton without errors", () => {
    const { container } = render(<CalendarEventSkeleton />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders IdeaCardSkeleton without errors", () => {
    const { container } = render(<IdeaCardSkeleton />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders VisionCardSkeleton without errors", () => {
    const { container } = render(<VisionCardSkeleton />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders WishlistCardSkeleton without errors", () => {
    const { container } = render(<WishlistCardSkeleton />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders DashboardStatSkeleton without errors", () => {
    const { container } = render(<DashboardStatSkeleton />);
    expect(container.firstChild).toBeDefined();
  });
});
