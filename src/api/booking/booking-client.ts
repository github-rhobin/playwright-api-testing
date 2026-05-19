import { APIRequestContext } from '@playwright/test';
import { createBookingRequest, partialUpdateBookingRequest, updateBookingRequest } from './booking-schema';
import { getResponseDetails } from '../../utils/api-util';

/**
 * Handles the nextwork communication.
 * It takes the data layer, send it to the API and returns the response details
 */
export class BookingClient {
  // Pass request context into the constructor
  constructor(
    private request: APIRequestContext,
    private authToken?: string
  ) {}

  // Client Methods
  async createBookingApi<T>(payload: createBookingRequest) {
    const startTime = Date.now(); // Start timer
    const response = await this.request.post('/booking', {
      data: payload, // randomized payload object
      timeout: 2_000, // allotted response time 2s
    });
    const duration = Date.now() - startTime; // Calculate duration in ms

    // Response Status Checker
    if (!response.ok()) {
      throw new Error(`Create Booking [POST] API failed. Status: ${response.status()} : ${response.statusText()}`);
    }

    return getResponseDetails<T>('POST', response, duration);
  }

  async getBookingApi<T>(bookingId: number) {
    const startTime = Date.now(); // Start timer
    const response = await this.request.get(`/booking/${bookingId}`, {
      timeout: 2_000, // allotted response time 2s
    });
    const duration = Date.now() - startTime; // Calculate duration in ms

    // Response Status Checker
    if (!response.ok()) {
      throw new Error(`Get Booking [GET] API failed. Status: ${response.status()} : ${response.statusText()}`);
    }

    return getResponseDetails<T>('GET', response, duration);
  }

  async getBookingIdsApi<T>(firstname?: string, lastname?: string, checkin?: string, checkout?: string) {
    // Gather all potential parameters
    const allParams = {
      firstname,
      lastname,
      checkin,
      checkout,
    };
    //Filter out undefined/not provided parameters
    const filteredParams = Object.fromEntries(
      Object.entries(allParams).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>;

    // Pass the filtered parameters to the API request
    const startTime = Date.now(); // Start timer
    const response = await this.request.get('/booking', {
      params: filteredParams,
      timeout: 2_000, // allotted response time 2s
    });
    const duration = Date.now() - startTime; // Calculate duration in ms

    // Response Status Checker
    if (!response.ok()) {
      throw new Error(`Get Booking IDs [GET] API failed. Status: ${response.status()} : ${response.statusText()}`);
    }

    return getResponseDetails<T>('GET', response, duration);
  }

  async updateBookingApi<T>(bookingId: number, payload: updateBookingRequest, overrideToken?: string) {
    // Resolve which token to use (method parameter override > stored fixture token > undefined)
    const activeToken = overrideToken !== undefined ? overrideToken : this.authToken;

    const startTime = Date.now(); // Start timer
    const response = await this.request.put(`/booking/${bookingId}`, {
      // Inject the authToken (Bearer/Cookie) in the request headers
      headers: {
        // Authorization: `Bearer ${this.authToken}`,
        // Dynamically injects the header if activeToken has a value
        ...(activeToken ? { Cookie: `token=${activeToken}` } : {}),
      },
      data: payload, // randomized payload object
      timeout: 2_000, // allotted response time 2s
    });
    const duration = Date.now() - startTime; // Calculate duration in ms

    // Response Status Checker
    if (!response.ok()) {
      throw new Error(`Update Booking [PUT] API failed. Status: ${response.status()} : ${response.statusText()}`);
    }

    return getResponseDetails<T>('PUT', response, duration);
  }

  async partialUpdateBookingApi<T>(bookingId: number, payload: partialUpdateBookingRequest, overrideToken?: string) {
    // Resolve which token to use (method parameter override > stored fixture token > undefined)
    const activeToken = overrideToken !== undefined ? overrideToken : this.authToken;
    const startTime = Date.now(); // Start timer
    const response = await this.request.patch(`/booking/${bookingId}`, {
      // Inject the authToken (Bearer/Cookie) in the request headers
      headers: {
        // Authorization: `Bearer ${this.authToken}`,
        // Dynamically injects the header if activeToken has a value
        ...(activeToken ? { Cookie: `token=${activeToken}` } : {}),
      },
      data: payload,
      timeout: 2_000, // allotted response time 2s
    });
    const duration = Date.now() - startTime; // Calculate duration in ms

    // Response Status Checker
    if (!response.ok()) {
      throw new Error(
        `Partial Update Booking [PATCH] API failed. Status: ${response.status()} : ${response.statusText()}`
      );
    }

    return getResponseDetails<T>('PATCH', response, duration);
  }
}
