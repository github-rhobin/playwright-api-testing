import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload } from '../src/api/booking/booking-factory';
import { BookingClient } from '../src/api/booking/booking-client';
import { createBookingResponse, getBookingResponse, getBookingResponseSchema } from '../src/api/booking/booking-schema';
import { z } from 'zod';

test('[GET] Get Booking Details', async ({ request }, testInfo) => {
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

  // Save the bookingid from the response
  const bookingId = postResponseDetails.body.bookingid;

  // Call the client GET method passing the bookingId
  const getResponseDetails = await bookingClient.getBookingApi<getBookingResponse>(bookingId);

  await test.step('Validation', async () => {
    // Flexible check for any success code (200-299)
    expect(getResponseDetails.isResponseSuccessful, 'Should be Success Status Code').toBe(true);

    // Strict check for a specific code
    expect(getResponseDetails.status, 'Status should be 200').toBe(200);

    // Header should have Content-Type = application/json
    expect(
      getResponseDetails.headers['content-type'],
      'Headers should have [content-type: application/json]'
    ).toContain('application/json');

    // Single Property Validation
    expect(getResponseDetails.body.firstname, `First Name should be '${requestPayload.firstname}'`).toBe(
      requestPayload.firstname
    );
    expect(getResponseDetails.body.totalprice, `Total Price should be '${requestPayload.totalprice}'`).toBe(
      requestPayload.totalprice
    );
    expect(getResponseDetails.body.depositpaid, `Deposit should be '${requestPayload.depositpaid}'`).toBe(
      requestPayload.depositpaid
    );
    expect(getResponseDetails.body.bookingdates, "Should have 'checkin' property").toHaveProperty('checkin');
    expect(getResponseDetails.body.bookingdates, "Should have 'checkout' property").toHaveProperty('checkout');

    // Zod Schema Validation
    const result = getBookingResponseSchema.safeParse(getResponseDetails.body);

    expect(result.success, `Schema Validation:\n${!result.success ? z.prettifyError(result.error) : ''}`).toBeTruthy();

    // Bulk Property Validation using .toMatchObject()
    expect(getResponseDetails.body, 'Should match the following details').toMatchObject(requestPayload);
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
