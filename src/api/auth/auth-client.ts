import { APIRequestContext } from '@playwright/test';
import { createTokenRequest } from './auth-schema';
import { getResponseDetails } from '../../utils/api-util';

/**
 * Handles the nextwork communication.
 * It takes the data layer, send it to the API and returns the response details
 */
export class AuthClient {
  // Pass request context into the constructor
  constructor(private request: APIRequestContext) {}

  // Client Methods
  async createTokenApi<T>(payload: createTokenRequest) {
    const startTime = Date.now(); // Start timer
    const response = await this.request.post('/auth', {
      data: payload,
      timeout: 2_000, // allotted response time 2s
    });
    const duration = Date.now() - startTime; // Calculate duration in ms

    // Response Status Checker
    if (!response.ok()) {
      throw new Error(`Create Token [POST] API failed. Status: ${response.status()} : ${response.statusText()}`);
    }

    // Read the body data once to check for API errors
    const responseData = await response.json();

    // Catch Restful-Booker's unique "200 OK but bad credentials" bug
    if (responseData.reason) {
      throw new Error(`Authentication Failed! Server returned reason: "${responseData.reason}".`);
    }

    return getResponseDetails<T>('POST', response, duration);
  }
}
