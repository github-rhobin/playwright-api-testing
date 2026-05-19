/**
 * Global Login Setup that can run before the test suite execution
 */
import { request } from '@playwright/test';
import { LoginClient } from '../login/login-client';

async function globalSetup() {
  // 1. Create an isolated request context
  const requestContext = await request.newContext({
    baseURL: 'https://restful-booker.herokuapp.com',
  });

  const authClient = new LoginClient(requestContext);

  try {
    // 2. Fetch the single token
    const token = await authClient.loginAuthenticationApi({
      username: process.env.API_USERNAME || 'admin',
      password: process.env.API_PASSWORD || 'password123',
    });

    // 3. Save it to a global environment variable
    process.env.API_GLOBAL_TOKEN = token;
    console.log('Successfully authenticated globally.');
  } catch (error) {
    console.error('Global authentication failed!', error);
    process.exit(1);
  }
}

export default globalSetup;
