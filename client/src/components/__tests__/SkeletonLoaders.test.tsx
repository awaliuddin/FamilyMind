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
  it("renders GroceryListSkeleton with animate-pulse", () => {
    const { container } = render(<GroceryListSkeleton />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders CalendarEventSkeleton with animate-pulse", () => {
    const { container } = render(<CalendarEventSkeleton />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders IdeaCardSkeleton with animate-pulse", () => {
    const { container } = render(<IdeaCardSkeleton />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders VisionCardSkeleton with animate-pulse", () => {
    const { container } = render(<VisionCardSkeleton />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders WishlistCardSkeleton with animate-pulse", () => {
    const { container } = render(<WishlistCardSkeleton />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders DashboardStatSkeleton with animate-pulse", () => {
    const { container } = render(<DashboardStatSkeleton />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });
});
