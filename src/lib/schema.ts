import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email, for example name@example.com.")
    .pipe(z.email("That email does not look right. Try name@example.com.")),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .regex(/^[\d\s()+-]{7,}$/, "That looks too short. Please check the number."),
  nationality: z.string().min(1, "Please choose your nationality."),
  flight: z
    .string()
    .trim()
    .min(1, "Please enter your flight number, for example IB6275.")
    .regex(/^[A-Za-z]{2}\d{1,4}$/, "Flight numbers start with the airline code, for example IB6275."),
  arrivalDate: z
    .string()
    .min(1, "Please choose your arrival date.")
    .refine((d) => ["2026-12-08", "2026-12-09", "2026-12-10"].includes(d), "Arrivals are open from 8 to 10 December. Please pick a date in that range."),
  arrivalTime: z.string().min(1, "Please add your arrival time."),
  notes: z.string().optional(),
});

export type GuestDetails = z.infer<typeof guestSchema>;

export const emptyGuest: GuestDetails = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  flight: "",
  arrivalDate: "",
  arrivalTime: "",
  notes: "",
};
