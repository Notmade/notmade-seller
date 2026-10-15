"use client";

import type { TimelineStep } from "../lib/seller-api";
import { RED } from "./portal-ui";

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

/** Placed → Accepted → Ready → AWB → Picked up → In transit → Delivered. Same steps admin and customers see. */
export default function OrderTimeline({ steps, cancelled = false }: { steps: TimelineStep[]; cancelled?: boolean }) {
  return (
    <ol className="sp-timeline" aria-label="Order progress">
      {steps.map((s, i) => {
        const color = s.done ? (cancelled ? "#BBBBBB" : RED) : "#E2E2E2";
        return (
          <li key={s.key} className={s.done ? "sp-tl-step done" : "sp-tl-step"} aria-current={s.current ? "step" : undefined}>
            <span className="sp-tl-dot" style={{ background: s.done ? color : "#FFFFFF", borderColor: color }}>
              {s.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" aria-hidden><path d="M5 12l5 5 9-11" /></svg>}
            </span>
            {i < steps.length - 1 && <span className="sp-tl-bar" style={{ background: steps[i + 1].done && !cancelled ? RED : "#E8E8E8" }} />}
            <span className="sp-tl-label">{s.label}</span>
            {s.at && <span className="sp-tl-at">{fmt(s.at)}</span>}
          </li>
        );
      })}
    </ol>
  );
}
