import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload } from '../src/api/booking/booking-factory';
import { BookingClient } from '../src/api/booking/booking-client';
import {
  createBookingResponse,
  getBookingIdsResponse,
  getBookingIdsResponseSchema,
} from '../src/api/booking/booking-schema';
import { stringifyJson } from '../src/utils/api-util';
import { z } from 'zod';

test('[GET] Get Booking Ids', async ({ request }, testInfo) => {
  /**
   * Since restful-booking heroku app auto clears bookings
   * we need to create booking first then vefiry the details.
   * We will reuse the POST request first then save the generated Booking ID
   * Then run the GET request targetting the saved Booking ID
   */

  //Instantiate the Client
  const bookingClient = new BookingClient(request);
  //You can insert the bookingClient fixture (which has authToken) as parameter to auto create a new Booking Client instance.

  //Generate the randomized data (payload)
  const requestPayload = await generateBookingApiPayload();

  //Call the client POST method
  const postResponseDetails = await bookingClient.createBookingApi<createBookingResponse>(requestPayload);

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('POST API RESPONSE', {
    body: stringifyJson(postResponseDetails),
    contentType: 'application/json',
  });

  // Save the optional query parameters from the response
  const firstname = postResponseDetails.body.booking.firstname;
  const lastname = postResponseDetails.body.booking.lastname;
  const checkin = postResponseDetails.body.booking.bookingdates.checkin;
  const checkout = postResponseDetails.body.booking.bookingdates.checkout;

  // Call the client GET method
  const getResponseDetails = await bookingClient.getBookingIdsApi<getBookingIdsResponse>(
    firstname,
    lastname
    //checkin,
    //checkout,
  );

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('GET API RESPONSE', {
    body: stringifyJson(getResponseDetails),
    contentType: 'application/json',
  });

  await test.step('Validation', async () => {
    // Strict check for a specific code
    expect(getResponseDetails.status, 'Status should be 200').toBe(200);

    // Flexible check for any success code (200-299)
    expect(getResponseDetails.isResponseSuccessful, 'Should be Success Status Code').toBe(true);

    // Header should have Content-Type = application/json
    expect(
      getResponseDetails.headers['content-type'],
      'Headers should have [content-type: application/json]'
    ).toContain('application/json');

    // Schema Validation
    const result = getBookingIdsResponseSchema.safeParse(getResponseDetails.body);
    expect(result.success, `Schema Validation:\n${!result.success ? z.prettifyError(result.error) : ''}`).toBeTruthy();

    // Assert Specific Record Exists
    const bookingIds = result.data;
    const expectedBookingId = postResponseDetails.body.bookingid;
    expect(bookingIds).toContainEqual({ bookingid: expectedBookingId });
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
