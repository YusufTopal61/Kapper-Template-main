export type Testimonial = {
  quote: string;
  name: string;
  /** Short context, for example the service the customer booked. */
  meta: string;
};

/**
 * Real customer reviews, with the customer's permission. Leave this empty until
 * they exist: the section is then not shown at all. Never invent entries.
 */
export const testimonials: readonly Testimonial[] = [];
