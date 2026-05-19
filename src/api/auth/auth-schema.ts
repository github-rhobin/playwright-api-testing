import { z } from 'zod';
/**
 * Declaring Data Structure and Type Safety using zod library
 * POST PUT PATCH - require payload
 * GET DELETE HEAD/OPTIONS - do not need payload
 */

/***** Create Token (POST) API *****/
export const createTokenRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type createTokenRequest = z.infer<typeof createTokenRequestSchema>;

export const createTokenResponseSchema = z.object({
  token: z.string(),
});
export type createTokenResponse = z.infer<typeof createTokenResponseSchema>;
