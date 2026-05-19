import { faker } from '@faker-js/faker';
import { createBookingRequest, partialUpdateBookingRequest } from './booking-schema';

/**
 * Helper function to generate payload matching the type safety data structure
 * Passing overrides allows you to easily test edge cases or static values.
 * @param firstName
 * @param lastName
 * @param totalPrice
 * @param depositPaid
 * @param checkIn
 * @param checkOut
 * @param additionalNeeds
 * @returns randomized Booking API Payload
 */
export async function generateBookingApiPayload(overrides?: createBookingRequest): Promise<createBookingRequest> {
  // 1. Generate Check-in (anytime in the next 30 days)
  const checkIn = faker.date.soon({ days: 30 });

  // 2. Generate Check-out (1 to 7 days after Check-in)
  const checkOut = faker.date.soon({ days: 7, refDate: checkIn });

  // 3. Format both as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 500, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: formatDate(checkIn),
      checkout: formatDate(checkOut),
      ...overrides?.bookingdates,
    },
    additionalneeds: generateHotelNote(),
    ...overrides, // Merges and overwrites any keys specified by the test
  };
}

/**
 * Generate Random Selection from a defined list of Hotel Notes
 * @returns - random Hotel Note from a defined list
 */
export function generateHotelNote() {
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
  // array of Additonal Needs choices
  return faker.helpers.arrayElement(requests);
}

/**
 * Helper function to generate "partial" payload matching the type safety data structure
 * Passing overrides allows you to easily test edge cases or static values.
 * @param firstName
 * @param lastName
 * @param totalPrice
 * @param depositPaid
 * @param checkIn
 * @param checkOut
 * @param additionalNeeds
 * @returns randomized Booking API Payload
 */
export async function generatePartialBookingApiPayload(
  overrides?: partialUpdateBookingRequest
): Promise<partialUpdateBookingRequest> {
  // 1. Generate Check-in (anytime in the next 30 days)
  const checkIn = faker.date.soon({ days: 30 });

  // 2. Generate Check-out (1 to 7 days after Check-in)
  const checkOut = faker.date.soon({ days: 7, refDate: checkIn });

  // 3. Format both as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    firstname: faker.helpers.maybe(() => faker.person.firstName()),
    lastname: faker.helpers.maybe(() => faker.person.lastName()),
    totalprice: faker.helpers.maybe(() => faker.number.int({ min: 500, max: 2000 })),
    depositpaid: faker.helpers.maybe(() => faker.datatype.boolean()),
    bookingdates: faker.helpers.maybe(() => ({
      checkin: formatDate(checkIn),
      checkout: formatDate(checkOut),
      ...overrides?.bookingdates,
      // Merges and overwrites any keys specified by the test
    })),
    additionalneeds: faker.helpers.maybe(() => generateHotelNote()),
    ...overrides,
    // Merges and overwrites any keys specified by the test
  };
}
