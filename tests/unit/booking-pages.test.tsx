import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ADDONS, PACKAGES } from "@/lib/catalog";
import { useBooking } from "@/store/booking";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const api = vi.hoisted(() => ({ fetchPackages: vi.fn(), fetchAddons: vi.fn(), submitBooking: vi.fn() }));
vi.mock("@/lib/mockApi", () => api);

import Choose from "@/app/booking/choose/page";
import Customise from "@/app/booking/customise/page";
import BuildRoom from "@/app/booking/build/room/page";
import BuildExperiences from "@/app/booking/build/experiences/page";
import Guest from "@/app/booking/guest/page";
import Review from "@/app/booking/review/page";
import Confirmation from "@/app/booking/confirmation/page";
import NotFound from "@/app/not-found";

const guest = {
  name: "Sofia Marin",
  email: "sofia.marin@example.com",
  phone: "+34 612 345 678",
  nationality: "Spain",
  flight: "ib6275",
  arrivalDate: "2026-12-09",
  arrivalTime: "14:30",
  notes: "",
};

beforeEach(() => {
  push.mockReset();
  api.fetchPackages.mockReset().mockResolvedValue(PACKAGES);
  api.fetchAddons.mockReset().mockResolvedValue(ADDONS);
  api.submitBooking.mockReset().mockResolvedValue({ reference: "MC26-48K2QX" });
});

describe("Choose (step 1)", () => {
  it("shows skeletons, then the three packages", async () => {
    render(<Choose />);
    expect(document.querySelector("[aria-busy=true]")).not.toBeNull();
    expect(await screen.findByText("Marea")).toBeInTheDocument();
    expect(screen.getByText("Costa")).toBeInTheDocument();
    expect(screen.getByText("Soberano")).toBeInTheDocument();
    expect(screen.getAllByText(/per person · \$6,400 for 2/).length).toBeGreaterThan(0);
    expect(screen.getByText("$3,200")).toBeInTheDocument();
  });
  it("selecting a package updates the store", async () => {
    render(<Choose />);
    await userEvent.click((await screen.findAllByRole("radio"))[0]);
    expect(useBooking.getState().packageId).toBe("marea");
  });
  it("announces new prices when the guest count changes, and caps at 6", async () => {
    render(<Choose />);
    await screen.findByText("Marea");
    await userEvent.click(screen.getByRole("button", { name: "More guests" }));
    expect(screen.getByRole("status")).toHaveTextContent("Prices updated for 3 guests");
    for (let i = 0; i < 5; i++) {
      const more = screen.getByRole("button", { name: "More guests" });
      if (!(more as HTMLButtonElement).disabled) await userEvent.click(more);
    }
    expect(useBooking.getState().guests).toBe(6);
    expect(screen.getByText(/Planning for more than 6/)).toBeInTheDocument();
  });
  it("shows an error panel with retry, and recovers", async () => {
    api.fetchPackages.mockRejectedValueOnce(new Error("x"));
    render(<Choose />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load the packages");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Costa")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("sold-out packages show a badge and block Continue when selected", async () => {
    api.fetchPackages.mockResolvedValue(PACKAGES.map((p) => (p.id === "costa" ? { ...p, soldOut: true } : p)));
    render(<Choose />);
    expect(await screen.findByText("Sold out")).toBeInTheDocument();
    expect(screen.getByText(/Join the waitlist/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue" })).toBeNull();
    screen.getAllByRole("button", { name: "Continue" }).forEach((b) => expect(b).toBeDisabled());
  });
  it("shows the low-stock line", async () => {
    api.fetchPackages.mockResolvedValue(PACKAGES.map((p) => (p.id === "marea" ? { ...p, left: 2 } : p)));
    render(<Choose />);
    expect(await screen.findByText("Only 2 places left")).toBeInTheDocument();
  });
  it("links to build your own", async () => {
    render(<Choose />);
    expect(screen.getByRole("link", { name: "Prefer to build your own?" })).toHaveAttribute("href", "/booking/build/room");
  });
  it("Continue goes to customise", async () => {
    render(<Choose />);
    await screen.findByText("Costa");
    screen.getAllByRole("link", { name: "Continue" }).forEach((l) => expect(l).toHaveAttribute("href", "/booking/customise"));
  });
});

describe("Customise (step 2) and the add-ons step", () => {
  it("lists add-ons by group with Add buttons priced for the group", async () => {
    render(<Customise />);
    expect(await screen.findByText("Private transfers")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Arrival" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Evenings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add · \$1,700/ })).toHaveAttribute("aria-pressed", "false");
  });
  it("toggles Added state and updates the store", async () => {
    render(<Customise />);
    const add = await screen.findByRole("button", { name: /Add · \$1,700/ });
    await userEvent.click(add);
    expect(useBooking.getState().addons).toContain("yacht");
    expect(screen.getByRole("button", { name: /Added · \$1,700/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: /Added · \$1,700/ }));
    expect(useBooking.getState().addons).not.toContain("yacht");
  });
  it("shows an error panel offering to continue without add-ons", async () => {
    api.fetchAddons.mockRejectedValueOnce(new Error("x"));
    render(<Customise />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load the add-ons");
    await userEvent.click(screen.getByRole("button", { name: "Continue without add-ons" }));
    expect(screen.getByRole("status")).toHaveTextContent("Continuing without add-ons");
  });
  it("marks a sold-out add-on and offers a notify link", async () => {
    api.fetchAddons.mockResolvedValue(ADDONS.map((a) => (a.id === "yacht" ? { ...a, soldOut: true } : a)));
    render(<Customise />);
    expect(await screen.findByText("Fully booked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Tell me if a place opens" })).toBeInTheDocument();
  });
  it("drops a saved add-on that has sold out, and says so", async () => {
    useBooking.setState({ addons: ["yacht", "transfers"] });
    api.fetchAddons.mockResolvedValue(ADDONS.map((a) => (a.id === "yacht" ? { ...a, soldOut: true } : a)));
    render(<Customise />);
    expect(await screen.findByText(/Yacht day is no longer available/)).toBeInTheDocument();
    expect(useBooking.getState().addons).toEqual(["transfers"]);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(/no longer available/)).toBeNull();
  });
  it("says 'No extras' while nothing is added and continues to the guest step", async () => {
    render(<Customise />);
    await screen.findByText("Private transfers");
    expect(screen.getAllByText(/No extras · 2 guests/).length).toBeGreaterThan(0);
    screen.getAllByRole("link", { name: "Continue" }).forEach((l) => expect(l).toHaveAttribute("href", "/booking/guest"));
  });
});

describe("Build your own", () => {
  it("room step: nights and guests steppers, room radios, continue to experiences", async () => {
    render(<BuildRoom />);
    await userEvent.click(screen.getByRole("button", { name: "Fewer nights" }));
    expect(useBooking.getState().nights).toBe(3);
    await userEvent.click(screen.getByRole("button", { name: "More guests" }));
    expect(useBooking.getState().guests).toBe(3);
    await userEvent.click(screen.getByRole("radio", { name: /Private villa/ }));
    expect(useBooking.getState().roomId).toBe("villa");
    expect(useBooking.getState().mode).toBe("build");
    expect(screen.getByRole("link", { name: "Back to the packages" })).toHaveAttribute("href", "/booking/choose");
    screen.getAllByRole("link", { name: "Continue" }).forEach((l) => expect(l).toHaveAttribute("href", "/booking/build/experiences"));
  });
  it("experiences step: shows the chosen room with a Change link", async () => {
    useBooking.setState({ mode: "build", roomId: "ocean", nights: 4 });
    render(<BuildExperiences />);
    expect(await screen.findByText("Ocean-view suite")).toBeInTheDocument();
    expect(screen.getByText(/4 nights · 2 guests/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Change" })).toHaveAttribute("href", "/booking/build/room");
    expect(await screen.findByText("Yacht day")).toBeInTheDocument();
  });
});

describe("Guest (step 3)", () => {
  it("shows an error summary, focuses it, and marks fields invalid", async () => {
    render(<Guest />);
    await userEvent.click(screen.getAllByRole("button", { name: "Review your booking" })[0]);
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("7 things need your attention");
    await waitFor(() => expect(summary).toHaveFocus());
    const name = screen.getByLabelText("Full name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAttribute("aria-describedby", "f-name-err");
    expect(document.getElementById("f-name-err")).toHaveTextContent("Please enter your full name.");
    expect(push).not.toHaveBeenCalled();
  });
  it("rejects a flight number in the wrong format", async () => {
    render(<Guest />);
    await userEvent.type(screen.getByLabelText("Flight number"), "6275IB");
    await userEvent.click(screen.getAllByRole("button", { name: "Review your booking" })[0]);
    // Shown both in the error summary and under the field
    expect((await screen.findAllByText(/Flight numbers start with the airline code/)).length).toBe(2);
    expect(screen.getByLabelText("Flight number")).toHaveAttribute("aria-invalid", "true");
  });
  it("saves valid details and goes to review", async () => {
    render(<Guest />);
    await userEvent.type(screen.getByLabelText("Full name"), guest.name);
    await userEvent.type(screen.getByLabelText("Email"), guest.email);
    await userEvent.type(screen.getByLabelText("Phone"), guest.phone);
    await userEvent.selectOptions(screen.getByLabelText("Nationality"), "Spain");
    await userEvent.type(screen.getByLabelText("Flight number"), "IB6275");
    await userEvent.type(screen.getByLabelText("Arrival date"), "2026-12-09");
    await userEvent.type(screen.getByLabelText("Arrival time"), "14:30");
    await userEvent.click(screen.getAllByRole("button", { name: "Review your booking" })[0]);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/booking/review"));
    expect(useBooking.getState().guest).toMatchObject({ name: "Sofia Marin", flight: "IB6275", nationality: "Spain" });
  });
  it("prefills from the saved booking", () => {
    useBooking.setState({ guest: { ...guest, flight: "IB6275" } });
    render(<Guest />);
    expect(screen.getByLabelText("Full name")).toHaveValue("Sofia Marin");
  });
  it("shows format hints for phone, flight and arrival date", () => {
    render(<Guest />);
    expect(screen.getByText(/Include the country code/)).toBeInTheDocument();
    expect(screen.getByText(/Airline code and number/)).toBeInTheDocument();
    expect(screen.getByText(/Arrivals are open 8 to 10 December/)).toBeInTheDocument();
  });
});

describe("Review (step 4)", () => {
  const seed = () => useBooking.setState({ guest, addons: ["yacht"] });

  it("summarises stay, extras, details and price", () => {
    seed();
    render(<Review />);
    expect(screen.getByRole("heading", { name: "Your stay" })).toBeInTheDocument();
    expect(screen.getAllByText("Costa · 2 × $3,200").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Yacht day · 2 × $850").length).toBeGreaterThan(0);
    expect(screen.getByText("Sofia Marin")).toBeInTheDocument();
    expect(screen.getByText(/Flight IB6275/)).toBeInTheDocument();
    expect(screen.getAllByText("$8,100").length).toBeGreaterThan(0);
  });
  it("Edit links depend on the booking mode", () => {
    seed();
    const { unmount } = render(<Review />);
    expect(screen.getByRole("link", { name: /Edit\s*stay/ })).toHaveAttribute("href", "/booking/choose");
    expect(screen.getByRole("link", { name: /Edit\s*extras/ })).toHaveAttribute("href", "/booking/customise");
    unmount();
    useBooking.setState({ mode: "build", roomId: "ocean" });
    render(<Review />);
    expect(screen.getByRole("link", { name: /Edit\s*stay/ })).toHaveAttribute("href", "/booking/build/room");
    expect(screen.getByRole("link", { name: /Edit\s*extras/ })).toHaveAttribute("href", "/booking/build/experiences");
  });
  it("says 'No extras' when there are none", () => {
    useBooking.setState({ guest });
    render(<Review />);
    expect(screen.getByText("No extras.")).toBeInTheDocument();
  });
  it("keeps Confirm disabled until the terms are accepted", async () => {
    seed();
    render(<Review />);
    const confirm = () => screen.getAllByRole("button", { name: /Confirm · \$8,100/ })[0];
    expect(confirm()).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(confirm()).toBeEnabled();
  });
  it("confirms, stores the reference and goes to the confirmation page", async () => {
    seed();
    render(<Review />);
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getAllByRole("button", { name: /Confirm/ })[0]);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/booking/confirmation"));
    expect(useBooking.getState().reference).toBe("MC26-48K2QX");
  });
  it("on failure says nothing was booked and offers to try again", async () => {
    seed();
    api.submitBooking.mockRejectedValueOnce(new Error("x"));
    render(<Review />);
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getAllByRole("button", { name: /Confirm/ })[0]);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We could not confirm your booking");
    expect(alert).toHaveTextContent("Nothing has been booked");
    expect(push).not.toHaveBeenCalled();
    expect(screen.getAllByRole("button", { name: "Try again · $8,100" })[0]).toBeEnabled();
  });
});

describe("Confirmation (step 5)", () => {
  it("shows the reference, summary and a restart action that resets the booking", async () => {
    useBooking.setState({ guest, reference: "MC26-48K2QX", addons: ["yacht"] });
    render(<Confirmation />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("See you in Cap Cana, Sofia.");
    expect(screen.getByText("MC26-48K2QX")).toBeInTheDocument();
    expect(screen.getByText("$8,100")).toBeInTheDocument();
    expect(screen.getByText(/sofia.marin@example.com/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Start a new booking" }));
    expect(useBooking.getState().reference).toBeNull();
  });
  it("without a reference, points back to the start", () => {
    render(<Confirmation />);
    expect(screen.getByRole("heading", { name: "No booking yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choose your stay" })).toHaveAttribute("href", "/booking/choose");
  });
  it("renders an empty busy shell before hydration", () => {
    useBooking.setState({ hydrated: false });
    const { container } = render(<Confirmation />);
    expect(container.querySelector("main")).toHaveAttribute("aria-busy", "true");
  });
});

describe("NotFound", () => {
  it("explains and links home", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("We could not find that page");
    expect(screen.getByRole("link", { name: "Back to Maré Caribe" })).toHaveAttribute("href", "/");
  });
});
