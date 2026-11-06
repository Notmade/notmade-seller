/** Used when SELLER_SIGNUP_COUNTRIES is not set. Also the default on the backend. */
export const DEFAULT_SIGNUP_COUNTRIES = ["IN"];

/**
 * Business countries open for new seller sign-ups. Same variable and default as the backend. Server
 * only: pages pass the result down, so changing the variable needs a restart and not a rebuild.
 */
export function signupCountries(raw = process.env.SELLER_SIGNUP_COUNTRIES): string[] {
  if (!raw) return DEFAULT_SIGNUP_COUNTRIES;
  return raw.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
}
