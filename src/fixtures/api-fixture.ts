import { test as base } from '@playwright/test';
import { BookingClient } from '../api/booking/booking-client';
import { AuthClient } from '../api/auth/auth-client';
import { createTokenResponse } from '../api/auth/auth-schema';

type ApiFixtures = {
  bookingClient: BookingClient;
  authToken: string;
};

export const test = base.extend<ApiFixtures>({
  /**
   * Login Client Fixture
   * @returns authToken - authenticated token
   */
  authToken: async ({ request }, use) => {
    const authClient = new AuthClient(request);

    // Perform login
    const responseDetails = await authClient.createTokenApi<createTokenResponse>({
      // You can save the login credentials in an .env or json file
      username: process.env.AUTH_USERNAME || 'admin',
      password: process.env.AUTH_PASSWORD || 'password123',
    });

    // Share the authToken
    await use(responseDetails.body.token);
  },

  /**
   * Booking Client Fixture with authToken
   * @returns new instance of Booking Client
   */

  bookingClient: async ({ request, authToken }, use) => {
    // If using global-setup.ts, just decalre the authToken here from env
    // Remove the loginAuthToken fixture if you will implement this

    // const loginAuthToken = process.env.API_GLOBAL_TOKEN;
    const client = new BookingClient(request, authToken);
    // Insert pre-test logics here...
    await use(client);
    // Insert post-test logics here...
  },
});

export { expect } from '@playwright/test';
