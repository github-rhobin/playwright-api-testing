import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload } from '../src/api/booking/booking-factory';
import {
  createBookingResponse,
  getBookingResponseSchema,
  updateBookingResponse,
} from '../src/api/booking/booking-schema';
import { stringifyJson } from '../src/utils/api-util';
import { z } from 'zod';

test('[PUT] Update Booking Details - Valid Token', { tag: ['@positive'] }, async ({ bookingClient }, testInfo) => {
  /**
   * Since restful-booking heroku app auto clears bookings
   * we need to create booking first then vefiry the details.
   * We will reuse the POST request first then save the generated Booking ID
   * Then run the PUT request targetting the saved Booking ID
   */

  //Instantiate the Client
  //Using the bookingClient fixture (which has authToken)

  //Generate the randomized data (payload)
  const postRequestPayload = await generateBookingApiPayload();

  //Call the client POST method
  const postResponseDetails = await bookingClient.createBookingApi<createBookingResponse>(postRequestPayload);

  // Save the bookingid from the response
  const bookingId = postResponseDetails.body.bookingid;

  //Generate the randomized update data (payload)
  const putRequestPayload = await generateBookingApiPayload();

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('PUT API REQUEST', {
    body: stringifyJson(putRequestPayload),
    contentType: 'application/json',
  });

  //Call the client PUT method passing the bookingId and putRequestPayload
  const putResponseDetails = await bookingClient.updateBookingApi<updateBookingResponse>(bookingId, putRequestPayload);

  await test.step('Validation', async () => {
    // Flexible check for any success code (200-299)
    expect(putResponseDetails.isResponseSuccessful, 'Should be Success Status Code').toBe(true);

    // Strict check for a specific code
    expect(putResponseDetails.status, 'Status should be 200').toBe(200);

    // Header should have Content-Type = application/json
    expect(
      putResponseDetails.headers['content-type'],
      'Headers should have [content-type: application/json]'
    ).toContain('application/json');

    // Zod Schema Validation
    const result = getBookingResponseSchema.safeParse(putResponseDetails.body);

    expect(result.success, `Schema Validation:\n${!result.success ? z.prettifyError(result.error) : ''}`).toBeTruthy();

    // Bulk Property Validation using .toMatchObject()
    expect(putResponseDetails.body, 'Should match the following details').toMatchObject(putRequestPayload);
  });
});

test('[PUT] Update Booking Details - Invalid/No Token', { tag: ['@negative'] }, async ({ bookingClient }, testInfo) => {
  /**
   * Since restful-booking heroku app auto clears bookings
   * we need to create booking first then vefiry the details.
   * We will reuse the POST request first then save the generated Booking ID
   * Then run the PUT request targetting the saved Booking ID
   */

  //Instantiate the Client
  //Using the bookingClient fixture (which has authToken)

  //Generate the randomized data (payload)
  const postRequestPayload = await generateBookingApiPayload();

  //Call the client POST method
  const postResponseDetails = await bookingClient.createBookingApi<createBookingResponse>(postRequestPayload);

  // Save the bookingid from the response
  const bookingId = postResponseDetails.body.bookingid;

  //Generate the randomized update data (payload)
  const putRequestPayload = await generateBookingApiPayload();

  //Call the client PUT method passing bookingId, putRequestPayload and empty authToken '' as negative test
  const putResponseDetails = await bookingClient.updateBookingApi<updateBookingResponse>(
    bookingId,
    putRequestPayload,
    '' // No Auth Token. Will result to Error 403 Forbidden
  );

  await test.step('Validation', async () => {
    // Flexible check for any success code (200-299)
    expect(putResponseDetails.isResponseSuccessful, 'Should be a Failed Response').toBe(false); // negative test

    // Strict check for a specific code
    expect(putResponseDetails.status, 'Status should be "403"').toBe(403);

    // Flexible check for any success code (200-299)
    expect(putResponseDetails.statusText, 'Status Text should be "Forbidden"').toBe('Forbidden');
  });
});

/**
 * ASSERTION SUMMARY REFERENCE
 * ----------------------------------------------------------------------------------------------------------------------------------------------------
 * | Assertion                | Best Used For                        | Comparison Type                                                                |
 * |--------------------------|--------------------------------------|--------------------------------------------------------------------------------|
 * | .toBe()                  | Status codes, booleans, exact strings| Identity/Strict (===) - Checks if they are the exact same instance in memory.  |
 * | .toEqual()               | Full JSON objects or Arrays          | Deep Equality -  Recursively checks if all fields and values inside match.     |
 * | .toMatchObject()         | Checking specific fields in a JSON   | Partial Match                                                                  |
 * | .toBeOK()                | Quick 200-299 status check           | Range check                                                                    |
 * | expect.objectContaining()| Partial matches inside Arrays/Objects| Asymmetric Matcher                                                             |
 * ----------------------------------------------------------------------------------------------------------------------------------------------------
 */
