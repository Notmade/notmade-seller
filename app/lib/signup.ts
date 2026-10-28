/** Same variable and default as the backend: business countries open for new seller sign-ups. Read at request time. */
export function signupCountries(): string[] {
  return (process.env.SELLER_SIGNUP_COUNTRIES || "IN").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
}
