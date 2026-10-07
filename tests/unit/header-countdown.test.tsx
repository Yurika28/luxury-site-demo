import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/SiteHeader";
import { Countdown } from "@/components/Countdown";

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;
let trigger: IOCallback;

beforeEach(() => {
  class FakeIO {
    constructor(cb: IOCallback) {
      trigger = cb;
    }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", FakeIO);
});
afterEach(() => vi.unstubAllGlobals());

describe("SiteHeader", () => {
  it("links home and to the booking flow", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Maré Caribe, home" })).toHaveAttribute("href", "/");
    const cta = screen.getByRole("link", { name: /book/i });
    expect(cta).toHaveAttribute("href", "/booking/choose");
  });
  it("starts transparent and turns solid once the sentinel leaves the viewport", () => {
    render(<SiteHeader />);
    const cta = screen.getByRole("link", { name: /book/i });
    expect(cta).toHaveClass("border-sand");
    act(() => trigger([{ isIntersecting: false }]));
    expect(cta).toHaveClass("bg-terracotta");
    act(() => trigger([{ isIntersecting: true }]));
    expect(cta).toHaveClass("border-sand");
  });
  it("only shows the dates once solid", () => {
    render(<SiteHeader />);
    const dates = screen.getByText(/10–13 December 2026 · Cap Cana/);
    expect(dates.className).not.toContain("lg:block");
    act(() => trigger([{ isIntersecting: false }]));
    expect(dates.className).toContain("lg:block");
  });
});

describe("Countdown", () => {
  it("shows placeholders until mounted, then counts down", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-07T00:00:00-04:00"));
    render(<Countdown />);
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "Countdown to 10 December 2026");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "03 days and 00 hours until we gather");
  });
  it("ticks every second", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-09T23:59:59-04:00"));
    render(<Countdown />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByRole("timer").textContent).toContain("01");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "00 days and 00 hours until we gather");
  });
  it("stops at zero after the event starts", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-11T00:00:00-04:00"));
    render(<Countdown />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "00 days and 00 hours until we gather");
  });
  it("hides the digits from screen readers", () => {
    const { container } = render(<Countdown />);
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBe(4);
  });
});
