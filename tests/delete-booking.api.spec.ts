import { test, expect } from '../src/fixtures/api-fixture';
import { generateBookingApiPayload } from '../src/api/booking/booking-factory';
import { createBookingResponse } from '../src/api/booking/booking-schema';

test('[DELETE] Delete Booking Details', async ({ bookingClient }, testInfo) => {
  /**
   * Since restful-booking heroku app auto clears bookings
   * we need to create booking first then vefiry the details.
   * We will reuse the POST request first then save the generated Booking ID
   * Then run the DELETE request targetting the saved Booking ID
   */

  //Instantiate the Client
  //Using the bookingClient fixture (which has authToken)

  //Generate the randomized data (payload)
  const postRequestPayload = await generateBookingApiPayload();

  //Call the client POST method
  const postResponseDetails = await bookingClient.createBookingApi<createBookingResponse>(postRequestPayload);

  // Save the bookingid from the response
  const bookingId = postResponseDetails.body.bookingid;

  //Call the client DELETE method passing the bookingId
  const deleteResponseDetails = await bookingClient.deleteBookingApi<any>(bookingId);

  await test.step('Validation', async () => {
    // Flexible check for any success code (200-299)
    expect(deleteResponseDetails.isResponseSuccessful, 'Should be a Succesful Response').toBe(true);

    // Strict check for a specific code
    expect(deleteResponseDetails.status, 'Status should be "201"').toBe(201);

    // Flexible check for any success code (200-299)
    expect(deleteResponseDetails.statusText, 'Status Text should be "Created"').toBe('Created');

    // Verify Respone Body has text 'Created'
    expect(deleteResponseDetails.body, 'Should have a response body text "Created"').toBe('Created');
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
