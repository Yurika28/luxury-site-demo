import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepFrame, type NextAction } from "@/components/booking/StepFrame";
import { BookingHydrator } from "@/components/booking/BookingHydrator";
import { STORAGE_KEY, useBooking } from "@/store/booking";

const frame = (next: NextAction, extra: Partial<React.ComponentProps<typeof StepFrame>> = {}) =>
  render(
    <StepFrame step={2} label="Make it yours" back="/booking/choose" title="Make it yours" next={next} {...extra}>
      <p>child content</p>
    </StepFrame>,
  );

describe("StepFrame", () => {
  it("shows the step label, five progress segments and the title", () => {
    const { container } = frame({ label: "Continue", href: "/x" });
    expect(screen.getByText(/Step 2 of 5 · Make it yours/i)).toBeInTheDocument();
    expect(container.querySelectorAll("[role=presentation] > span")).toHaveLength(5);
    expect(container.querySelectorAll("[role=presentation] > .bg-terracotta")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 1, name: "Make it yours" })).toBeInTheDocument();
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
  it("has a back link and a wordmark link", () => {
    frame({ label: "Continue", href: "/x" });
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/booking/choose");
    expect(screen.getByRole("link", { name: "Maré Caribe" })).toHaveAttribute("href", "/");
  });
  it("shows the total in the bar and the desktop summary", () => {
    frame({ label: "Continue", href: "/x" });
    // Costa × 2 guests
    expect(screen.getAllByText("$6,400").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Total · 2 guests/).length).toBeGreaterThanOrEqual(1);
  });
  it("says 'No extras' when asked", () => {
    frame({ label: "Continue", href: "/x" }, { showNoExtras: true });
    expect(screen.getAllByText(/No extras · 2 guests/).length).toBeGreaterThanOrEqual(1);
  });
  it("leaves unavailable add-ons out of the total", () => {
    useBooking.setState({ addons: ["yacht"] });
    frame({ label: "Continue", href: "/x" }, { unavailable: ["yacht"] });
    expect(screen.queryByText("$8,100")).toBeNull();
  });
  it("expands the price lines in the mobile bar", async () => {
    useBooking.setState({ addons: ["spa"] });
    frame({ label: "Continue", href: "/x" });
    const toggle = screen.getByRole("button", { name: /Total · 2 guests/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("price-lines")).toHaveTextContent("Spa ritual · 2 × $320");
  });
  it("renders the next action as a link when it has an href", () => {
    frame({ label: "Continue", href: "/booking/guest" });
    screen.getAllByRole("link", { name: "Continue" }).forEach((l) => expect(l).toHaveAttribute("href", "/booking/guest"));
  });
  it("renders a disabled button, not a link, when disabled", () => {
    frame({ label: "Continue", href: "/booking/guest", disabled: true });
    expect(screen.queryByRole("link", { name: "Continue" })).toBeNull();
    screen.getAllByRole("button", { name: "Continue" }).forEach((b) => expect(b).toBeDisabled());
  });
  it("fires onClick and shows a busy state", async () => {
    const onClick = vi.fn();
    const { rerender } = frame({ label: "Confirm", onClick });
    await userEvent.click(screen.getAllByRole("button", { name: "Confirm" })[0]);
    expect(onClick).toHaveBeenCalled();
    rerender(
      <StepFrame step={4} label="Review" back="/" title="t" next={{ label: "Confirm", onClick, busy: true }}>
        x
      </StepFrame>,
    );
    screen.getAllByRole("button", { name: "Confirm" }).forEach((b) => {
      expect(b).toBeDisabled();
      expect(b).toHaveAttribute("aria-busy", "true");
    });
  });
  it("links the submit button to a form", () => {
    frame({ label: "Review", formId: "guest-form" });
    screen.getAllByRole("button", { name: "Review" }).forEach((b) => {
      expect(b).toHaveAttribute("type", "submit");
      expect(b).toHaveAttribute("form", "guest-form");
    });
  });

  describe("welcome-back banner", () => {
    it("shows on steps 1 and 2 for a returning visitor, and can be dismissed", async () => {
      useBooking.setState({ restored: true });
      frame({ label: "Continue", href: "/x" });
      expect(screen.getByRole("status")).toHaveTextContent("Welcome back. We saved your choices.");
      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByRole("status")).toBeNull();
    });
    it("Start again resets the booking", async () => {
      useBooking.setState({ restored: true, guests: 5 });
      frame({ label: "Continue", href: "/x" });
      await userEvent.click(screen.getByRole("button", { name: "Start again" }));
      expect(useBooking.getState().guests).toBe(2);
    });
    it("does not show on later steps or on a first visit", () => {
      useBooking.setState({ restored: true });
      const { unmount } = frame({ label: "Continue", href: "/x" }, { step: 3 });
      expect(screen.queryByRole("status")).toBeNull();
      unmount();
      useBooking.setState({ restored: false });
      frame({ label: "Continue", href: "/x" });
      expect(screen.queryByRole("status")).toBeNull();
    });
  });
});

describe("BookingHydrator", () => {
  // The store writes to localStorage on every change, so set up storage after resetting it.
  const run = async (saved?: object) => {
    useBooking.setState({ hydrated: false, restored: false });
    window.localStorage.removeItem(STORAGE_KEY);
    if (saved) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: saved, version: 1 }));
    render(<BookingHydrator />);
    await vi.waitFor(() => expect(useBooking.getState().hydrated).toBe(true));
  };

  it("first visit: hydrates without the welcome-back flag", async () => {
    await run();
    expect(useBooking.getState().restored).toBe(false);
    expect(window.sessionStorage.getItem("mare:seen")).toBe("1");
  });
  it("returning visit: saved choices and a new session set the flag and load the saved state", async () => {
    await run({ guests: 4 });
    expect(useBooking.getState().restored).toBe(true);
    expect(useBooking.getState().guests).toBe(4);
  });
  it("same session: does not show the banner again", async () => {
    window.sessionStorage.setItem("mare:seen", "1");
    await run({ guests: 4 });
    expect(useBooking.getState().restored).toBe(false);
  });
  it("renders nothing", () => {
    const { container } = render(<BookingHydrator />);
    expect(within(container).queryByRole("generic")).toBeNull();
  });
});
