"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestSchema, type GuestDetails } from "@/lib/schema";
import { useBooking } from "@/store/booking";
import { StepFrame } from "@/components/booking/StepFrame";
import { ErrorIcon } from "@/components/booking/ui";

const COUNTRIES = ["Spain", "United States", "United Kingdom", "France", "Germany", "Italy", "Mexico", "Dominican Republic", "Other"];
const FORM_ID = "guest-form";
const input = "min-h-[52px] w-full border bg-paper px-4 text-base text-espresso placeholder:text-muted";

export default function Guest() {
  const router = useRouter();
  const hydrated = useBooking((s) => s.hydrated);
  const summaryRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, submitCount },
  } = useForm<GuestDetails>({
    resolver: zodResolver(guestSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: false, // the error summary takes focus instead
    defaultValues: useBooking.getState().guest,
  });

  useEffect(() => {
    if (hydrated) reset(useBooking.getState().guest);
  }, [hydrated, reset]);

  const entries = Object.entries(errors) as [keyof GuestDetails, { message?: string }][];
  const showSummary = submitCount > 0 && entries.length > 0;
  useEffect(() => {
    if (showSummary) summaryRef.current?.focus();
  }, [showSummary, submitCount]);

  const onValid = (data: GuestDetails) => {
    useBooking.getState().setGuest(data);
    router.push("/booking/review");
  };

  const field = (name: keyof GuestDetails, label: string, el: (p: { id: string; cls: string; aria: object }) => React.ReactNode, hint?: string) => {
    const err = errors[name]?.message;
    const id = `f-${name}`;
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {el({
          id,
          cls: `${input} ${err ? "border-2 border-error" : "border-field"}`,
          aria: { "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-err` : hint ? `${id}-hint` : undefined },
        })}
        {hint && !err && <p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>}
        {err && (
          <p id={`${id}-err`} className="flex items-start gap-2 text-sm text-error">
            <ErrorIcon />
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <StepFrame
      step={3}
      label="Your details"
      back="/booking/customise"
      title="Your details"
      lede="So we can meet you when you land. We only use these for this booking."
      next={{ label: "Review your booking", formId: FORM_ID }}
    >
      {showSummary && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="flex flex-col gap-2 border border-l-4 border-hairline border-l-error bg-paper p-5">
          <strong className="text-base font-semibold text-error">
            {entries.length === 1 ? "One thing needs your attention" : `${entries.length} things need your attention`}
          </strong>
          <ul className="flex flex-col text-[15px]">
            {entries.map(([k, e]) => (
              <li key={k}>
                <a href={`#f-${k}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{e.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form id={FORM_ID} noValidate onSubmit={handleSubmit(onValid)} className="flex max-w-[560px] flex-col gap-5">
        {field("name", "Full name", ({ id, cls, aria }) => <input id={id} autoComplete="name" className={cls} {...aria} {...register("name")} />)}
        {field("email", "Email", ({ id, cls, aria }) => <input id={id} type="email" autoComplete="email" inputMode="email" className={cls} {...aria} {...register("email")} />)}
        {field("phone", "Phone", ({ id, cls, aria }) => <input id={id} type="tel" autoComplete="tel" className={cls} {...aria} {...register("phone")} />, "Include the country code, for example +34 612 345 678.")}
        {field("nationality", "Nationality", ({ id, cls, aria }) => (
          <select id={id} className={cls} {...aria} {...register("nationality")}>
            <option value="">Choose</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        ))}
        {field("flight", "Flight number", ({ id, cls, aria }) => <input id={id} autoCapitalize="characters" autoComplete="off" className={cls} {...aria} {...register("flight")} />, "Airline code and number, for example IB6275.")}
        <div className="grid gap-5 sm:grid-cols-2">
          {field("arrivalDate", "Arrival date", ({ id, cls, aria }) => <input id={id} type="date" min="2026-12-08" max="2026-12-10" className={cls} {...aria} {...register("arrivalDate")} />, "Arrivals are open 8 to 10 December.")}
          {field("arrivalTime", "Arrival time", ({ id, cls, aria }) => <input id={id} type="time" className={cls} {...aria} {...register("arrivalTime")} />)}
        </div>
        {field("notes", "Anything we should know? (optional)", ({ id, cls, aria }) => <textarea id={id} rows={3} className={`${cls} py-3`} {...aria} {...register("notes")} />)}
      </form>
    </StepFrame>
  );
}
