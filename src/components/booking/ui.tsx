import type { ReactNode } from "react";

export const primaryBtn =
  "flex min-h-[52px] items-center justify-center gap-2.5 bg-terracotta px-7 text-[13px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#9A4224] disabled:cursor-not-allowed disabled:bg-hairline disabled:text-muted";
export const linkBtn =
  "inline-flex min-h-11 items-center text-[15px] font-medium text-terracotta underline underline-offset-4";
export const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.22em]";

export const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5l3.2 3.2L13 4.8" />
  </svg>
);
export const ErrorIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#A3281E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0">
    <circle cx="8" cy="8" r="6.2" />
    <path d="M8 4.8v3.8M8 11v.1" />
  </svg>
);
export const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0">
    <circle cx="8" cy="8" r="6.2" />
    <path d="M8 7.2V11M8 5v.1" />
  </svg>
);
export const Spinner = () => (
  <svg className="animate-spin motion-reduce:animate-none" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M9 2a7 7 0 1 0 7 7" />
  </svg>
);

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`sk ${className}`} />;
}

/** Inline failure panel. Always say whether anything was lost. */
export function ErrorPanel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col gap-5 border border-l-4 border-hairline border-l-error bg-paper p-6">
      <div className="flex items-start gap-3">
        <span className="mt-1"><ErrorIcon size={22} /></span>
        <h2 className="font-display text-[28px] leading-[1.1]">{title}</h2>
      </div>
      <p className="text-[15px] leading-relaxed text-muted">{children}</p>
      {actions}
    </div>
  );
}

export function AlertBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col gap-2.5 border border-l-4 border-hairline border-l-error bg-paper p-5">
      <div className="flex items-start gap-2.5">
        <ErrorIcon size={20} />
        <strong className="text-base font-semibold leading-snug text-error">{title}</strong>
      </div>
      <p className="text-[15px] leading-relaxed">{children}</p>
    </div>
  );
}

export function Notice({ title, children, onDismiss, dismissLabel = "Dismiss" }: { title: string; children?: ReactNode; onDismiss?: () => void; dismissLabel?: string }) {
  return (
    <div role="status" className="flex items-start gap-3 border border-l-4 border-hairline border-l-espresso bg-paper px-5 py-4.5">
      <InfoIcon />
      <div className="flex flex-1 flex-col gap-1.5">
        <strong className="text-[15px] font-semibold leading-snug">{title}</strong>
        {children && <div className="text-sm leading-relaxed text-muted">{children}</div>}
        {onDismiss && (
          <button onClick={onDismiss} className="min-h-11 w-fit text-sm font-medium text-terracotta underline underline-offset-4">
            {dismissLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function Stepper({ label, sub, value, min, max, onChange, noun }: { label: string; sub?: string; value: number; min: number; max: number; onChange: (n: number) => void; noun: string }) {
  const btn = "size-11 border border-field text-xl text-espresso disabled:border-hairline disabled:text-muted";
  return (
    <div className="flex min-h-[56px] items-center justify-between border-b border-hairline py-1">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium">{label}</span>
        {sub && <span className="text-[13px] text-muted">{sub}</span>}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" aria-label={`Fewer ${noun}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>−</button>
        <span aria-live="polite" className="w-10 text-center text-[17px] font-medium">{value}</span>
        <button type="button" aria-label={`More ${noun}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>+</button>
      </div>
    </div>
  );
}
