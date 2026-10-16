"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, fmtDateTime, type SellerNotification } from "../lib/seller-api";
import { currencySymbol } from "../lib/currency";
import { useSellerCurrency } from "../dashboard/seller-context";

const SEEN_KEY = "nm_seller_notifs_seen";
const ICON: Record<Exclude<SellerNotification["type"], "payout">, string> = {
  new_order: "N", reminder: "!", awb_ready: "A", cancelled: "×", product: "✓",
};

function readSeen(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") as string[]); } catch { return new Set(); }
}
function writeSeen(ids: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids).slice(-300))); } catch { /* storage blocked */ }
}

/** New orders, accept reminders, AWB ready, payouts and product reviews. Polls every minute. */
export default function NotificationsBell({ dark = false }: { dark?: boolean }) {
  const { currency } = useSellerCurrency();
  const icon = (t: SellerNotification["type"]) => (t === "payout" ? currencySymbol(currency) : ICON[t]);
  const [items, setItems] = useState<SellerNotification[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try { setItems((await api.notifications()).notifications); } catch { /* keep the last list */ }
  }, []);

  useEffect(() => {
    setSeen(readSeen());
    void load();
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 60_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  // Urgent reminders stay unread until acted on
  const unread = items.filter(n => n.urgent || !seen.has(n.id)).length;

  const markAll = () => {
    const next = new Set(Array.from(seen).concat(items.map(n => n.id)));
    setSeen(next); writeSeen(next);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open}
        className={dark ? "sp-bell sp-bell-dark" : "sp-bell"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && <span className="sp-bell-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="sp-notif-panel" role="dialog" aria-label="Notifications">
          <div className="sp-notif-head">
            <strong>Notifications</strong>
            {items.length > 0 && <button type="button" onClick={markAll}>Mark all read</button>}
          </div>
          {items.length === 0 ? (
            <p style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "#888" }}>You&apos;re all caught up.</p>
          ) : (
            <ul>
              {items.map(n => {
                const isNew = n.urgent || !seen.has(n.id);
                return (
                  <li key={n.id}>
                    <Link href={n.href} onClick={() => { const s = new Set(seen); s.add(n.id); setSeen(s); writeSeen(s); setOpen(false); }}
                      className={`sp-notif${isNew ? " unread" : ""}${n.urgent ? " urgent" : ""}`}>
                      <span className="sp-notif-icon" aria-hidden style={icon(n.type).length > 1 ? { fontSize: 9 } : undefined}>{icon(n.type)}</span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span className="sp-notif-title">{n.title}</span>
                        {n.body && <span className="sp-notif-body">{n.body}</span>}
                        <span className="sp-notif-at">{fmtDateTime(n.at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
