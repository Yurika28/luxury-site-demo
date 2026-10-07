"use client";
import Link from "next/link";
import { ROOMS, EVENT } from "@/lib/catalog";
import { usd } from "@/lib/pricing";
import { useBooking } from "@/store/booking";
import { StepFrame } from "@/components/booking/StepFrame";
import { Stepper, linkBtn } from "@/components/booking/ui";

export default function BuildRoom() {
  const { hydrated, guests, nights, roomId, setGuests, setNights, setRoom } = useBooking();

  return (
    <StepFrame
      step={1}
      label="Your room"
      back="/booking/choose"
      title="Build your own"
      lede="Choose a room and how long you will stay. You pick the experiences next."
      next={{ label: "Continue", href: "/booking/build/experiences", disabled: !roomId, onClick: () => useBooking.getState().setMode("build") }}
    >
      {hydrated && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <Stepper label="Nights" sub={`Arriving ${EVENT.arrival.split("-")[2]} December`} noun="nights" value={nights} min={1} max={4} onChange={setNights} />
            <Stepper label="Guests" sub={`Up to ${EVENT.maxGuests} online`} noun="guests" value={guests} min={1} max={EVENT.maxGuests} onChange={setGuests} />
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Room</legend>
            {ROOMS.map((r) => {
              const on = roomId === r.id;
              return (
                <label key={r.id} className={`flex cursor-pointer flex-col gap-3 border-2 p-5 ${on ? "border-terracotta bg-paper" : "border-hairline"}`}>
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="font-display block text-[28px] leading-none">{r.name}</span>
                      <span className="mt-1.5 block text-sm text-muted">{r.note}</span>
                    </span>
                    <input type="radio" name="room" checked={on} onChange={() => setRoom(r.id)} className="size-6 shrink-0 accent-terracotta" />
                  </span>
                  <span className="font-display text-[28px] leading-none">
                    {usd(r.perNight)}{" "}
                    <span className="font-sans text-[13px] text-muted">per person per night · {usd(r.perNight * nights * guests)} for {guests} × {nights}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <Link href="/booking/choose" className={`${linkBtn} w-fit`}>Back to the packages</Link>
        </div>
      )}
    </StepFrame>
  );
}
