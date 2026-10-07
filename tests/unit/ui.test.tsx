import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertBanner, CheckIcon, ErrorIcon, ErrorPanel, InfoIcon, Notice, Skeleton, Spinner, Stepper } from "@/components/booking/ui";

describe("Stepper", () => {
  it("calls onChange with the next and previous value", async () => {
    const onChange = vi.fn();
    render(<Stepper label="Guests" noun="guests" value={2} min={1} max={6} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "More guests" }));
    await userEvent.click(screen.getByRole("button", { name: "Fewer guests" }));
    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 1);
  });
  it("disables the buttons at the limits", () => {
    const { rerender } = render(<Stepper label="Guests" noun="guests" value={1} min={1} max={6} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Fewer guests" })).toBeDisabled();
    rerender(<Stepper label="Guests" noun="guests" value={6} min={1} max={6} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "More guests" })).toBeDisabled();
  });
  it("announces the value politely and shows the sub label", () => {
    render(<Stepper label="Nights" sub="Arriving 9 December" noun="nights" value={4} min={1} max={4} onChange={() => {}} />);
    expect(screen.getByText("4")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Arriving 9 December")).toBeInTheDocument();
  });
});

describe("Notice", () => {
  it("is a status region and dismisses", async () => {
    const onDismiss = vi.fn();
    render(<Notice title="Prices updated for 3 guests" onDismiss={onDismiss}>Body</Notice>);
    expect(screen.getByRole("status")).toHaveTextContent("Prices updated for 3 guests");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });
  it("has no dismiss button without a handler", () => {
    render(<Notice title="Hello" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("ErrorPanel and AlertBanner", () => {
  it("ErrorPanel is an alert with a heading and actions", () => {
    render(<ErrorPanel title="We could not load" actions={<button>Try again</button>}>On our side.</ErrorPanel>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "We could not load" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
  it("AlertBanner is an alert", () => {
    render(<AlertBanner title="Could not confirm">Nothing booked.</AlertBanner>);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not confirm");
  });
});

describe("Skeleton and icons", () => {
  it("renders a skeleton with the pulse class", () => {
    const { container } = render(<Skeleton className="h-10" />);
    expect(container.firstChild).toHaveClass("sk", "h-10");
  });
  it("hides decorative icons from assistive tech", () => {
    const { container } = render(<><CheckIcon /><ErrorIcon /><InfoIcon /><Spinner /></>);
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(4);
    svgs.forEach((s) => expect(s).toHaveAttribute("aria-hidden", "true"));
  });
});
