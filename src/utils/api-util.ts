import { APIResponse, test } from '@playwright/test';

/**
 * Simplified function to stringified Json object (if you wanna print it in the report/terminal)
 * @param object - typed as Record<key,value> to make sure it will only accept Json objects
 * @returns stringified object
 */
export function stringifyJson(object: Record<string, any>): string {
  return JSON.stringify(object, null, 2);
}

/**
 * Utility Function that formats the API Request for dynamic values (user provided or random generation)
 * @param template
 * @param values
 * @returns formatted data
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
 * Generic utility for getting the Response Details
 * If Failed - attach info
 * If Passed - log the info
 * @param method
 * @param response
 * @param duration
 * @returns response object
 */
export async function getResponseDetails<T>(method: string, response: APIResponse, duration: number) {
  const rawText = await response.text();
  const contentType = response.headers()['content-type'] || '';
  let parsedBody: any = null;

  // 1. Safely handle JSON parsing based on Content-Type
  if (contentType.includes('application/json') && rawText) {
    try {
      parsedBody = JSON.parse(rawText) as T;
    } catch (error) {
      parsedBody = `[Failed to parse JSON: ${error}] Original Text: ${rawText}`;
    }
  } else {
    parsedBody = rawText || null;
  }

  // 2. Build the structured response tracking block
  const responseLog = {
    url: response.url(),
    method: method,
    duration: `${duration}ms`,
    status: response.status(),
    statusText: response.statusText(),
    response: {
      headers: response.headers(),
      body: parsedBody,
    },
  };

  const formattedLog = stringifyJson(responseLog);

  // 3. Centralized Smart Reporting Logic
  if (!response.ok()) {
    // FAILED: Create a prominent attachment in the Playwright report UI
    await test.info().attach(`[FAILED] ${method} | ${response.status()} - ${response.statusText()} | (${duration}ms)`, {
      contentType: 'application/json',
      body: formattedLog,
    });
  } else {
    // PASSED: Put cleanly into standard stdout logs (tucked neatly inside the test step)
    console.log(
      `\n[SUCCESS] ${method} | ${response.status()} - ${response.statusText()} | (${duration}ms)\n`,
      formattedLog
    );
  }

  // 4. Return the structured object back to your API helper methods
  return {
    url: response.url(),
    method: method,
    duration: `${duration}ms`,
    status: response.status(),
    statusText: response.statusText(),
    isResponseSuccessful: response.ok(),
    headers: response.headers(),
    body: parsedBody,
  };
}
