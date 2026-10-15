import india from "./in";
import uae from "./ae";
import global from "./global";
import type { ModeCode, ModeContent } from "./types";

export type { ModeCode, ModeContent } from "./types";

/** Switcher order. */
export const MODES: ModeContent[] = [india, uae, global];
export const DEFAULT_MODE: ModeCode = "in";

export const isModeCode = (v: unknown): v is ModeCode => v === "in" || v === "ae" || v === "global";

export const getMode = (code: string | null | undefined): ModeContent =>
  MODES.find((m) => m.code === code) ?? india;
