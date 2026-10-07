import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { useBooking } from "@/store/booking";

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  useBooking.getState().reset();
  useBooking.setState({ hydrated: true, restored: false, restoredDismissed: false });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
