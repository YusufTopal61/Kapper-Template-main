import { z } from "zod";
import { dateSchema, emailSchema, timeSchema } from "@/lib/validations/primitives";

/**
 * Dutch phone number, tolerant of spaces, dashes and +31.
 * 0612345678, 06 12 34 56 78, +31 6 12345678 and 010-1234567 are all fine.
 */
const phoneSchema = z
  .string()
  .trim()
  .min(1, "Vul je telefoonnummer in.")
  .max(30, "Dit telefoonnummer is te lang.")
  .refine((value) => {
    const digits = value.replace(/[\s-().]/g, "");
    return /^(\+31|0031|0)[1-9]\d{8}$/.test(digits);
  }, "Dit lijkt geen geldig Nederlands telefoonnummer.");

export const bookingStatusSchema = z.enum(["confirmed", "cancelled", "completed", "no_show"]);

export const bookingInputSchema = z.object({
  serviceId: z.string().uuid("Kies een geldige dienst."),
  customerName: z.string().trim().min(2, "Vul je naam in.").max(120, "Deze naam is te lang."),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  date: dateSchema,
  time: timeSchema,
});

/** Only the customer details, for the last step of the booking form. */
export const bookingCustomerSchema = bookingInputSchema.pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
});

export const cancelByTokenSchema = z.object({
  bookingId: z.string().uuid(),
  // The generated token is 64 hex characters; anything far beyond that length is never valid.
  token: z.string().min(16, "Ongeldige annuleerlink.").max(128, "Ongeldige annuleerlink."),
});

export const adminBookingUpdateSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  customerName: z.string().trim().min(2).max(120).optional(),
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema.optional(),
  date: dateSchema.optional(),
  time: timeSchema.optional(),
  status: bookingStatusSchema.optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const bookingIdSchema = z.object({ id: z.string().uuid() });

export const availableSlotsSchema = z.object({
  date: dateSchema,
  serviceId: z.string().uuid(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
export type BookingCustomerInput = z.infer<typeof bookingCustomerSchema>;
export type AdminBookingUpdate = z.infer<typeof adminBookingUpdateSchema>;
export type CancelByTokenInput = z.infer<typeof cancelByTokenSchema>;
export type AvailableSlotsInput = z.infer<typeof availableSlotsSchema>;
