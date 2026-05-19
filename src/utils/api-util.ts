import { APIResponse } from '@playwright/test';

/**
 * Simplified function to stringified Json object (if you wanna print it in the report/terminal)
 * @param object - typed as Record<key,value> to make sure it will only accept Json objects
 * @returns Stringified Object
 */
export function stringifyJson(object: Record<string, any>): string {
  return JSON.stringify(object, null, 2);
}

/**
 * Utility Function that formats the API Request for dynamic values (user provided or random generation)
 *
 * @param template
 * @param values
 * @returns
 */
export async function formatApiRequest(template: string, values: any[]): Promise<string> {
  // Regex looks for optional double quotes around the placeholder: "{index}" or {index}
  return template.replace(/"?\{(\d+)\}"?/g, (match, p1) => {
    const index = parseInt(p1, 10);
    if (index >= values.length) return match;

    const value = values[index];

    // If the value is a number or boolean, return it without quotes
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    // Otherwise, it's a string; return it with quotes to keep JSON valid
    return `"${value}"`;
  });
}

/**
 * Utility function that gets the full API reponse details
 *
 * @param method
 * @param response
 * @param duration
 * @returns
 */
export async function getResponseDetails<T>(method: string, response: APIResponse, duration: number) {
  return {
    url: response.url(),
    method: method,
    duration: `${duration}ms`,
    status: response.status(),
    statusText: response.statusText(),
    isResponseSuccessful: response.ok(), // Extracts the boolean flag directly (true if status is 200-299)
    headers: response.headers(),
    body: (await response.json()) as T,
    // Enforce type safety on the response body using the BookingPayload interface + bookingid
  };
}
