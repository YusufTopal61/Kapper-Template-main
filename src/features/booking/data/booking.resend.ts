import "server-only";
import { withDefaults } from "@/features/settings/domain/settings.rules";
import type { SettingsRepository } from "@/features/settings/domain/settings.repository";
import type { BookingNotifier } from "../domain/booking.ports";
import type { BookingMailData } from "../domain/booking.entity";
import { adminBookingsUrl, cancelUrl, bookAgainUrl } from "./links";
import { sendEmails } from "./mailer";
import {
  appointmentChangedCustomer,
  cancellationAdmin,
  cancellationConfirmedCustomer,
  bookingConfirmationCustomer,
  newBookingAdmin,
  type EmailBusiness,
  type EmailBooking,
} from "./mail-templates";

function toEmailBooking(booking: BookingMailData): EmailBooking {
  return {
    id: booking.id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    date: booking.date,
    time: booking.time,
    serviceName: booking.serviceName,
    price: booking.price,
    durationMinutes: booking.durationMinutes,
  };
}

/**
 * Verstuurt de mails rond een boeking via Resend. Elke methode vangt al haar
 * fouten af: de afspraak staat op dat moment al, en een mislukte mail mag die
 * niet terugdraaien. Fouten worden gelogd, niet doorgegeven.
 */
export function createResendBookingNotifier(deps: {
  settings: Pick<SettingsRepository, "read">;
}): BookingNotifier {
  async function context() {
    const settings = withDefaults(await deps.settings.read());
    const business: EmailBusiness = {
      businessName: settings.businessName,
      address: settings.address,
      phoneNumber: settings.phoneNumber,
    };
    return { business, adminEmail: settings.adminEmail };
  }

  return {
    async bookingCreated(booking) {
      try {
        const { business, adminEmail } = await context();
        const mail = toEmailBooking(booking);

        const results = await sendEmails([
          {
            to: booking.customerEmail,
            content: bookingConfirmationCustomer(
              mail,
              business,
              await cancelUrl(booking.id, booking.cancelToken),
            ),
          },
          { to: adminEmail, content: newBookingAdmin(mail, business, await adminBookingsUrl()) },
        ]);

        return { customerMailSent: results[0]?.status === "sent" };
      } catch (error) {
        console.error("[booking] bevestigingsmails versturen mislukt:", error);
        return { customerMailSent: false };
      }
    },

    async bookingCancelled(booking, by) {
      try {
        const { business, adminEmail } = await context();
        const mail = toEmailBooking(booking);

        await sendEmails([
          {
            to: booking.customerEmail,
            content: cancellationConfirmedCustomer(mail, business, await bookAgainUrl()),
          },
          {
            to: adminEmail,
            content: cancellationAdmin(mail, business, await adminBookingsUrl(), by === "customer"),
          },
        ]);
      } catch (error) {
        console.error("[booking] annuleringsmails versturen mislukt:", error);
      }
    },

    async bookingRescheduled(booking) {
      try {
        const { business } = await context();

        await sendEmails([
          {
            to: booking.customerEmail,
            content: appointmentChangedCustomer(
              toEmailBooking(booking),
              business,
              await cancelUrl(booking.id, booking.cancelToken),
            ),
          },
        ]);
      } catch (error) {
        console.error("[booking] wijzigingsmail versturen mislukt:", error);
      }
    },
  };
}
