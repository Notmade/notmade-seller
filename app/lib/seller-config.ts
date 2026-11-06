// Public seller-programme facts shown across the marketing pages, terms and JSON-LD. Rates, copy and
// company details live in the country files (app/landing/content/in.ts, ae.ts) and are re-exported here.
// Change a number at its source and every page that quotes it follows.
import {
  COMMISSION_STATEMENT, ENTITY as ENTITY_IN, LEGAL_ENTITY as ENTITY_NAME_INDIA, MIN_PRODUCTS, RETURN_WINDOW_DAYS, SETTLEMENT_DAYS,
  STORE_URL as INDIA_STORE_URL,
} from "../landing/content/in";
import {
  ENTITY as ENTITY_AE, LEGAL_ENTITY as ENTITY_NAME_UAE, STORE_URL as UAE_STORE_URL, SUPPORT_EMAIL as UAE_SUPPORT,
} from "../landing/content/ae";
import type { Entity } from "../landing/content/types";

export type { Entity };

export const SITE_URL = "https://seller.notmade.in";
export const MAIN_SITE_URL = INDIA_STORE_URL;
export const UAE_SITE_URL = UAE_STORE_URL;
export const INSTAGRAM_URL = "https://instagram.com/notmade.in";
export const CONTACT_EMAIL = "admin@notmade.in";
export const SELLER_SUPPORT_EMAIL = "seller@notmade.in";
export const UAE_SUPPORT_EMAIL = UAE_SUPPORT;

/** Legal entities that sign the seller agreement (from the backend agreement templates). */
export const LEGAL_ENTITY_INDIA = ENTITY_NAME_INDIA;
export const LEGAL_ENTITY_UAE = ENTITY_NAME_UAE;

/** The India commission statement, word for word, everywhere it is quoted. */
export const COMMISSION_STATEMENT_INDIA = COMMISSION_STATEMENT;
/** Days a seller's settlement is paid in. */
export const SETTLEMENT_DAYS_AFTER_DELIVERY = SETTLEMENT_DAYS;
/** Days from delivery a customer has to raise a return (with an unboxing video). */
export { RETURN_WINDOW_DAYS, MIN_PRODUCTS };
/** Days of written notice to end the India agreement, or to stop selling in the UAE (seller agreements). */
export const NOTICE_DAYS_INDIA = 30;
export const NOTICE_DAYS_UAE = 14;
/** Days after termination within which pending settlements are paid (both agreements). */
export const TERMINATION_SETTLEMENT_DAYS = 30;
/** Days of written notice before NOTMADE changes the UAE commission rate (UAE seller agreement). */
export const UAE_RATE_CHANGE_NOTICE_DAYS = 14;
/** Days of written notice to take products off one India partner channel (India seller agreement). */
export const PARTNER_CHANNEL_NOTICE_DAYS = 14;

export const INDIA_PHONE = ENTITY_IN.phone;

/** The company a seller contracts with, by seller country. */
export const ENTITY_BY_COUNTRY: Record<"IN" | "AE", Entity> = { IN: ENTITY_IN, AE: ENTITY_AE };
