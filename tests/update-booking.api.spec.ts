import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload } from '../src/api/booking/booking-factory';
import {
  createBookingResponse,
  getBookingResponseSchema,
  updateBookingResponse,
} from '../src/api/booking/booking-schema';
import { stringifyJson } from '../src/utils/api-util';
import { z } from 'zod';

test('[PATCH] Partial Update Booking Details', async ({ bookingClient }, testInfo) => {
  /**
   * Since restful-booking heroku app auto clears bookings
   * we need to create booking first then vefiry the details.
   * We will reuse the POST request first then save the generated Booking ID
   * Then run the PATCH request targetting the saved Booking ID
   */

  //Instantiate the Client
  //Using the bookingClient fixture (which has authToken)

  //Generate the randomized data (payload)
  const postRequestPayload = await generateBookingApiPayload();

  //Call the client POST method
  const postResponseDetails = await bookingClient.createBookingApi<createBookingResponse>(postRequestPayload);

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('POST API RESPONSE', {
    body: stringifyJson(postResponseDetails),
    contentType: 'application/json',
  });

  // Save the bookingid from the response
  const bookingId = postResponseDetails.body.bookingid;

  //Generate the randomized update data (payload)
  const putRequestPayload = await generateBookingApiPayload();

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('PUT API REQUEST', {
    body: stringifyJson(putRequestPayload),
    contentType: 'application/json',
  });

  //Call the client PUT method
  const putResponseDetails = await bookingClient.updateBookingApi<updateBookingResponse>(bookingId, putRequestPayload);

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('PUT API RESPONSE', {
    body: stringifyJson(putResponseDetails),
    contentType: 'application/json',
  });

  await test.step('Validation', async () => {
    // Strict check for a specific code
    expect(putResponseDetails.status, 'Status should be 200').toBe(200);

    // Flexible check for any success code (200-299)
    expect(putResponseDetails.isResponseSuccessful, 'Should be Success Status Code').toBe(true);

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
});
