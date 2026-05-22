import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload } from '../src/api/booking/booking-factory';
import { BookingClient } from '../src/api/booking/booking-client';
import { createBookingResponse, createBookingResponseSchema } from '../src/api/booking/booking-schema';
import { stringifyJson } from '../src/utils/api-util';
import { z } from 'zod';

test('[POST] Create Booking', async ({ request }, testInfo) => {
  //Instantiate the Client
  const bookingClient = new BookingClient(request);
  //You can insert the bookingClient fixture (which has authToken) as parameter to auto create a new Booking Client instance.

  //Generate the randomized data (payload)
  const requestPayload = await generateBookingApiPayload();

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('POST API REQUEST', {
    body: stringifyJson(requestPayload),
    contentType: 'application/json',
  });

  //Call the client method which return response details
  const responseDetails = await bookingClient.createBookingApi<createBookingResponse>(requestPayload);

  // Stringify Response Details for reports
  const stringifiedResponse = stringifyJson(responseDetails);

  await test.step('Validation', async () => {
    // Strict check for a specific code
    expect(responseDetails.status, 'Status should be 200').toBe(200);

    // Flexible check for any success code (200-299)
    expect(responseDetails.isResponseSuccessful, 'Should be Success Status Code').toBe(true);

    // Header should have Content-Type = application/json
    expect(responseDetails.headers['content-type'], 'Headers should have [content-type: application/json]').toContain(
      'application/json'
    );

    // Single Property Validation
    expect(responseDetails.body.booking.firstname, `First Name should be '${requestPayload.firstname}'`).toBe(
      requestPayload.firstname
    );
    expect(responseDetails.body.booking.totalprice, `Total Price should be '${requestPayload.totalprice}'`).toBe(
      requestPayload.totalprice
    );
    expect(responseDetails.body.booking.depositpaid, `Deposit should be '${requestPayload.depositpaid}'`).toBe(
      requestPayload.depositpaid
    );
    expect(responseDetails.body.booking.bookingdates, "Should have 'checkin' property").toHaveProperty('checkin');
    expect(responseDetails.body.booking.bookingdates, "Should have 'checkout' property").toHaveProperty('checkout');

    // Zod Schema Validation
    const result = createBookingResponseSchema.safeParse(responseDetails.body);
    expect(result.success, `Schema Validation:\n${!result.success ? z.prettifyError(result.error) : ''}`).toBeTruthy();

    // Bulk Property Validation using .toMatchObject()
    expect(responseDetails.body, 'Should match the following details').toMatchObject({
      bookingid: expect.any(Number), // this is auto generated so just check the type
      booking: {
        firstname: requestPayload.firstname,
        lastname: requestPayload.lastname,
        totalprice: requestPayload.totalprice,
        depositpaid: requestPayload.depositpaid,

        // Partial Contents Validation
        // expect.arrayContaining([])
        // expect.objectContaining({})
        bookingdates: expect.objectContaining({
          checkin: requestPayload.bookingdates.checkin,
          // checkout valiadtion can be included
        }),
        additionalneeds: requestPayload.additionalneeds,
      },
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
});
