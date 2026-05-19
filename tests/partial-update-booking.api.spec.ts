import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload, generatePartialBookingApiPayload } from '../src/api/booking/booking-factory';
import {
  createBookingResponse,
  getBookingResponseSchema,
  partialUpdateBookingResponse,
} from '../src/api/booking/booking-schema';
import { stringifyJson } from '../src/utils/api-util';
import { z } from 'zod';

test('[PATCH] Partial Update Booking Details - With Token', async ({ bookingClient }, testInfo) => {
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

  //Generate the randomized partial data (payload)
  const patchRequestPayload = await generatePartialBookingApiPayload();

  // CRITICAL STEP: Strip out all the 'undefined' keys that Faker skipped for clear payload vs response value assertions later
  const cleanPatchRequestPayload = JSON.parse(JSON.stringify(patchRequestPayload));

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('PATCH API REQUEST', {
    body: stringifyJson(cleanPatchRequestPayload),
    contentType: 'application/json',
  });

  //Call the client PATCH method passing the "cleanPatchRequestPayload" (without any possible undefined properties)
  const patchResponseDetails = await bookingClient.partialUpdateBookingApi<partialUpdateBookingResponse>(
    bookingId,
    cleanPatchRequestPayload
  );

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('PATCH API RESPONSE', {
    body: stringifyJson(patchResponseDetails),
    contentType: 'application/json',
  });

  await test.step('Validation', async () => {
    // Strict check for a specific code
    expect(patchResponseDetails.status, 'Status should be 200').toBe(200);

    // Flexible check for any success code (200-299)
    expect(patchResponseDetails.isResponseSuccessful, 'Should be Success Status Code').toBe(true);

    // Header should have Content-Type = application/json
    expect(
      patchResponseDetails.headers['content-type'],
      'Headers should have [content-type: application/json]'
    ).toContain('application/json');

    // Zod Schema Validation
    const result = getBookingResponseSchema.safeParse(patchResponseDetails.body);

    expect(result.success, `Schema Validation:\n${!result.success ? z.prettifyError(result.error) : ''}`).toBeTruthy();

    // Bulk Property Validation using .toMatchObject()
    expect(patchResponseDetails.body, 'Should match the following details').toMatchObject(cleanPatchRequestPayload);
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
