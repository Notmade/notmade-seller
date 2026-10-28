// Public seller-programme facts shown across the marketing pages, terms and JSON-LD.
// Change a number here and every page that quotes it follows.

export const SITE_URL = "https://seller.notmade.in";
export const MAIN_SITE_URL = "https://notmade.in";
export const UAE_SITE_URL = "https://uae.notmade.in";
export const INSTAGRAM_URL = "https://instagram.com/notmade.in";
export const CONTACT_EMAIL = "admin@notmade.in";

/** NOTMADE's commission on each completed sale in India, in percent. */
export const COMMISSION_PCT_INDIA = 17;
/** Days after delivery that a seller's settlement is paid. */
export const SETTLEMENT_DAYS_AFTER_DELIVERY = 7;
/** Days from delivery a customer has to raise a return (with an unboxing video). */
export const RETURN_WINDOW_DAYS = 7;
/** Minimum products needed to go live (seller terms). */
export const MIN_PRODUCTS = 10;
/** Typical account review time after the agreement is signed (onboarding copy). */
export const REVIEW_HOURS = 48;
/** Days of written notice to end the India agreement, or to stop selling in the UAE (seller agreements). */
export const NOTICE_DAYS_INDIA = 30;
export const NOTICE_DAYS_UAE = 14;
/** Days after termination within which pending settlements are paid (both agreements). */
export const TERMINATION_SETTLEMENT_DAYS = 30;
/** Days of written notice before NOTMADE changes the UAE commission rate (UAE seller agreement). */
export const UAE_RATE_CHANGE_NOTICE_DAYS = 14;
/** Days of written notice to take products off one India partner channel (India seller agreement). */
export const PARTNER_CHANNEL_NOTICE_DAYS = 14;

export const INDIA_PHONE = "+91 93548 52701";

export interface Entity {
  /** Name shown on the site; the agreement carries the full registered name. */
  name: string;
  registeredOffice: string;
  ids: { label: string; value: string }[];
  phone: string;
  law: string;
  store: string;
}

/**
 * The company a seller contracts with, by seller country. Copied from the current backend agreements
 * (in-v2 for India, uae-local-v2 for the UAE); update both together when an agreement version changes.
 */
export const ENTITY_BY_COUNTRY: Record<"IN" | "AE", Entity> = {
  IN: {
    name: "House of Notmade Studio",
    registeredOffice: "GK-II/41/C-2, Second Floor, Gyan Khand-2, Shipra Sun City, Indirapuram, Ghaziabad, Uttar Pradesh 201014, India",
    ids: [{ label: "CIN", value: "U62099UW2026PTC256850" }, { label: "GSTIN", value: "09AAICH8658N1ZM" }],
    phone: INDIA_PHONE,
    law: "Laws of India, with arbitration seated in Ghaziabad, Uttar Pradesh",
    store: MAIN_SITE_URL,
  },
  AE: {
    name: "House of Notmade Studio FZE LLC",
    registeredOffice: "Office No. BC-894509, 26th Floor, Amber Gem Tower, Sheikh Khalifa Street, Ajman, United Arab Emirates",
    ids: [{ label: "Licence No.", value: "2628021907888" }],
    phone: "+971 55 759 0282",
    law: "Laws of the UAE as applied in Ajman, with the courts of Ajman",
    store: UAE_SITE_URL,
  },
};
