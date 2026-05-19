import { test, expect, APIResponse } from '@playwright/test';
import { formatApiRequest } from '../src/utils/api-util';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';

test('[POST] Create Booking using Faker Data', async ({ request }, testInfo) => {
  const filePath = path.join(__dirname, '../test-data/dynamic-booking-data.json');
  const jsonTemplate = fs.readFileSync(filePath, 'utf-8');

  const generateHotelNote = () => {
    const requests = [
      'late check-in',
      'extra towels',
      'high floor',
      'quiet room',
      'near elevator',
      'king size bed',
      'honeymoon package',
      'vegan breakfast options',
    ];
    return faker.helpers.arrayElement(requests);
  };

  // 1. Generate Check-in (anytime in the next 30 days)
  const checkIn = faker.date.soon({ days: 30 });

  // 2. Generate Check-out (1 to 7 days after Check-in)
  const checkOut = faker.date.soon({ days: 7, refDate: checkIn });

  // 3. Format both as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Dynamic Values using Faker-JS library
  const values = [
    faker.person.firstName(),
    faker.person.lastName(),
    faker.number.int({ min: 500, max: 2000 }),
    faker.datatype.boolean(),
    formatDate(checkIn),
    formatDate(checkOut),
    generateHotelNote(),
  ];
  const requestString = await formatApiRequest(jsonTemplate, values);
  const requestData = JSON.parse(requestString);

  // Attach the stringified JSON to the current step in the report
  await testInfo.attach('REQUEST', {
    body: requestString,
    contentType: 'application/json',
  });

  // Run the API Request
  const startTime = Date.now(); // Start timer
  const response = await request.post('/booking', {
    data: requestData,
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
    expect(responseDetails.body.booking.firstname, `First Name should be '${requestData.firstname}'`).toBe(
      requestData.firstname
    );
    expect(responseDetails.body.booking.totalprice, `Total Price should be '${requestData.totalprice}'`).toBe(
      requestData.totalprice
    );
    expect(responseDetails.body.booking.depositpaid, `Deposit should be '${requestData.depositpaid}'`).toBe(
      requestData.depositpaid
    );
    expect(responseDetails.body.booking.bookingdates, "Should have 'checkin' property").toHaveProperty('checkin');
    expect(responseDetails.body.booking.bookingdates, "Should have 'checkout' property").toHaveProperty('checkout');

    // Bulk Property Validation using .toMatchObject()
    expect(responseDetails.body, 'Should match the following details').toMatchObject({
      bookingid: expect.any(Number), // this is auto generated so just check the type
      booking: {
        firstname: requestData.firstname,
        lastname: requestData.lastname,
        totalprice: requestData.totalprice,
        depositpaid: requestData.depositpaid,

        // Partial Contents Validation
        // expect.arrayContaining([])
        // expect.objectContaining({})
        bookingdates: expect.objectContaining({
          checkin: requestData.bookingdates.checkin,
          // checkout valiadtion can be included
        }),
        additionalneeds: requestData.additionalneeds,
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
