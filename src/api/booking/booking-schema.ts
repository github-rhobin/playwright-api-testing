import { z } from 'zod';
/**
 * Declaring Data Structure and Type Safety using zod library
 * POST PUT PATCH - require payload
 * GET DELETE HEAD/OPTIONS - do not need payload
 */

/***** Booking Dates *****/
export const BookingDatesSchema = z.object({
  checkin: z.string(),
  checkout: z.string(),
});
export type BookingDates = z.infer<typeof BookingDatesSchema>;

/***** Create Booking (POST) API *****/
export const createBookingRequestSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema, // Reuses the schema above
  additionalneeds: z.string().optional(), // Marked optional since the API sometimes omits it
});
export type createBookingRequest = z.infer<typeof createBookingRequestSchema>;
export const createBookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: createBookingRequestSchema, // Reuses the schema above!
});
export type createBookingResponse = z.infer<typeof createBookingResponseSchema>;

/***** Get  Booking (GET) API *****/
export const getBookingResponseSchema = createBookingRequestSchema;
// getBookingResponseSchema is the same structure as the createBookingRequestSchema
// hence, just assign it directly
export type getBookingResponse = z.infer<typeof getBookingResponseSchema>;

/***** Get Booking Ids (GET) API *****/
export const getBookingIdsResponseSchema = z.array(
  z.object({
    bookingid: z.number(),
  })
);
export type getBookingIdsResponse = z.infer<typeof getBookingIdsResponseSchema>;

/***** Update Booking (PUT) API *****/
export const updateBookingRequestSchema = createBookingRequestSchema;
export type updateBookingRequest = z.infer<typeof updateBookingRequestSchema>;
export const updateBookingResponseSchema = createBookingRequestSchema;
export type updateBookingResponse = z.infer<typeof updateBookingResponseSchema>;

/***** Partial Update Booking (PATCH) API *****/
export const partialUpdateBookingRequestSchema = createBookingRequestSchema.partial();
export type partialUpdateBookingRequest = z.infer<typeof partialUpdateBookingRequestSchema>;
export const partialUpdateBookingResponseSchema = createBookingRequestSchema;
export type partialUpdateBookingResponse = z.infer<typeof partialUpdateBookingResponseSchema>;
