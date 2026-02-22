// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { parseCommand } from "../useVoiceCommands";

const mockGroceryLists = [
  { id: "l1", store: "Costco" },
  { id: "l2", store: "Walmart" },
  { id: "l3", store: "Trader Joe's" },
];

describe("parseCommand — navigation", () => {
  it("recognizes 'go to' commands", () => {
    const result = parseCommand("go to grocery", mockGroceryLists);
    expect(result).toEqual({ type: "navigate", tab: "grocery", transcript: "go to grocery" });
  });

  it("recognizes 'open' commands", () => {
    const result = parseCommand("open calendar", mockGroceryLists);
    expect(result).toEqual({ type: "navigate", tab: "calendar", transcript: "open calendar" });
  });

  it("recognizes 'show' commands", () => {
    const result = parseCommand("show recipes", mockGroceryLists);
    expect(result).toEqual({ type: "navigate", tab: "recipes", transcript: "show recipes" });
  });

  it("resolves tab aliases", () => {
    expect(parseCommand("go to shopping", mockGroceryLists).tab).toBe("grocery");
    expect(parseCommand("go to schedule", mockGroceryLists).tab).toBe("calendar");
    expect(parseCommand("go to goals", mockGroceryLists).tab).toBe("vision");
    expect(parseCommand("go to gifts", mockGroceryLists).tab).toBe("wishlist");
    expect(parseCommand("go to cooking", mockGroceryLists).tab).toBe("recipes");
    expect(parseCommand("go to home", mockGroceryLists).tab).toBe("dashboard");
  });

  it("handles standalone tab name as navigation", () => {
    const result = parseCommand("calendar", mockGroceryLists);
    expect(result).toEqual({ type: "navigate", tab: "calendar", transcript: "calendar" });
  });
});

describe("parseCommand — grocery add", () => {
  it("parses 'add item to store list' commands", () => {
    const result = parseCommand("add milk to costco list", mockGroceryLists);
    expect(result).toEqual({
      type: "grocery-add",
      item: "milk",
      store: "Costco",
      transcript: "add milk to costco list",
    });
  });

  it("matches store name fuzzily (partial match)", () => {
    const result = parseCommand("add eggs to trader", mockGroceryLists);
    expect(result).toEqual({
      type: "grocery-add",
      item: "eggs",
      store: "Trader Joe's",
      transcript: "add eggs to trader",
    });
  });

  it("returns unknown if store not found", () => {
    const result = parseCommand("add milk to target", mockGroceryLists);
    expect(result.type).toBe("unknown");
  });
});

describe("parseCommand — unknown", () => {
  it("returns unknown for unrecognized commands", () => {
    const result = parseCommand("what is the weather", mockGroceryLists);
    expect(result).toEqual({ type: "unknown", transcript: "what is the weather" });
  });

  it("handles case insensitivity and whitespace", () => {
    const result = parseCommand("  GO TO GROCERY  ", mockGroceryLists);
    expect(result).toEqual({ type: "navigate", tab: "grocery", transcript: "  GO TO GROCERY  " });
  });
});
