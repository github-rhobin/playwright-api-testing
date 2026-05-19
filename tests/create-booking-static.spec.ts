import { test, expect, APIResponse } from '@playwright/test';
import requestData from '../test-data/static-booking-data.json';

test('[POST] Create Booking using Static Data', async ({ request }, testInfo) => {
  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('REQUEST', {
    body: JSON.stringify(requestData.validBooking, null, 2),
    contentType: 'application/json',
  });

  const startTime = Date.now(); // Start timer
  const response = await request.post('/booking', {
    data: requestData.validBooking,
    timeout: 10_000, // allotted response time 10s
  });
  const duration = Date.now() - startTime; // Calculate duration in ms

  // Utility Function to get Response Details
  async function getResponseDetails(method: string, response: APIResponse, duration: number) {
    return {
      url: response.url(),
      method: method,
      duration: `${duration}ms`,
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body: await response.json(),
    };
  }

  // Collect details for the report
  const responseDetails = await getResponseDetails('POST', response, duration);
  const stringifiedResponse = JSON.stringify(responseDetails, null, 2);

  // Print Response Body
  // console.log("RAW RESPONSE OBJECT:", responseDetails);
  // console.log(`STRINGIFIED RESPONSE OBJECT: ${stringifiedResponse}`);

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('RESPONSE', {
    body: stringifiedResponse,
    contentType: 'application/json',
  });

  test.step('Validation', async () => {
    // Strict check for a specific code
    expect(response.status(), 'Status should be 200').toBe(200);

    // Flexible check for any success code (200-299)
    expect(response, 'Should be Success Status Code').toBeOK();

    // Header should have Content-Type = application/json
    expect(response.headers()['content-type'], 'Headers should have [content-type: application/json]').toContain(
      'application/json'
    );

    // Single Property Validation
    expect(responseDetails.body.booking.firstname, "First Name should be 'John'").toBe(
      requestData.validBooking.firstname
    );
    expect(responseDetails.body.booking.totalprice, "Total Price should be '1000'").toBe(
      requestData.validBooking.totalprice
    );
    expect(responseDetails.body.booking.depositpaid, "Deposit should be 'Paid'").toBe(
      requestData.validBooking.depositpaid
    );
    expect(responseDetails.body.booking.bookingdates, "Should have 'checkin' property").toHaveProperty('checkin');
    expect(responseDetails.body.booking.bookingdates, "Should have 'checkout' property").toHaveProperty('checkout');

    // Bulk Property Validation using .toMatchObject()
    expect(responseDetails.body, 'Should match the following details').toMatchObject({
      bookingid: expect.any(Number), // this is auto generated so just check the type
      booking: {
        firstname: requestData.validBooking.firstname,
        lastname: requestData.validBooking.lastname,
        totalprice: requestData.validBooking.totalprice,
        depositpaid: requestData.validBooking.depositpaid,

        // Partial Contents Validation
        // expect.arrayContaining([])
        // expect.objectContaining({})
        bookingdates: expect.objectContaining({
          checkin: requestData.validBooking.bookingdates.checkin,
          // checkout valiadtion can be included
        }),
        additionalneeds: requestData.validBooking.additionalneeds,
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
