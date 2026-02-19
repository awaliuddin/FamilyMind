/// <reference types="vitest/globals" />

// Suppress noisy console output during tests
const noop = () => {};
vi.spyOn(console, "error").mockImplementation(noop);
vi.spyOn(console, "warn").mockImplementation(noop);
