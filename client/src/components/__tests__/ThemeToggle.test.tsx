// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeToggle } from "../shared/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  it("renders a button with theme toggle label", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    expect(button).toBeDefined();
  });

  it("defaults to light theme", () => {
    render(<ThemeToggle />);
    // In light mode, dark class should not be present
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles to dark theme on click", async () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    fireEvent.click(button);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles back to light on second click", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    fireEvent.click(button); // light -> dark
    fireEvent.click(button); // dark -> light
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("restores theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
