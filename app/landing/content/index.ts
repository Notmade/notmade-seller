import type { ModeCode } from "./types";

export type { ModeCode, PageContent } from "./types";

export const DEFAULT_MODE: ModeCode = "in";
/** Set by middleware from ?market=, read back when a seller returns to /. */
export const MARKET_COOKIE = "nm_market";

export const isModeCode = (v: unknown): v is ModeCode => v === "in" || v === "ae";

/** Which landing page to show: an explicit ?market= wins, then the saved cookie, then India. */
export function selectMode(query: string | string[] | undefined, cookie: string | undefined): ModeCode {
  if (isModeCode(query)) return query;
  return isModeCode(cookie) ? cookie : DEFAULT_MODE;
}
