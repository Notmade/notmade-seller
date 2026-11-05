"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fmtDateTime, isNotLive, type SellerNotification } from "../../lib/seller-api";
import { currencySymbol } from "../../lib/currency";
import { ICON, readSeen, writeSeen } from "../../components/NotificationsBell";
import { useSellerCurrency } from "../seller-context";
import { Alert, Button, Card, EmptyState, PageHeader, PageSkeleton } from "../../components/portal-ui";

export default function NotificationsPage() {
  const { currency } = useSellerCurrency();
  const [items, setItems] = useState<SellerNotification[] | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    setSeen(readSeen());
    const load = () => api.notifications().then(r => { setItems(r.notifications); setError(""); }).catch(err => {
      if (isNotLive(err)) setItems(i => i ?? []);
      else setError(err instanceof Error ? err.message : "Could not load notifications");
    });
    void load();
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 60_000);
    return () => clearInterval(t);
  }, []);

  const mark = (ids: string[]) => { const next = new Set(Array.from(seen).concat(ids)); setSeen(next); writeSeen(next); };

  if (error) return <Alert>{error}</Alert>;
  if (!items) return <PageSkeleton stats={0} />;
  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <EmptyState title="You're all caught up" sub="New orders, reminders and payouts appear here."
          action={<Link href="/dashboard/orders" className="sp-btn-red">Go to orders</Link>} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="Notifications" sub="We also email you about new orders."
        action={<Button variant="secondary" onClick={() => mark(items.map(n => n.id))}>Mark all read</Button>} />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map(n => {
            const icon = n.type === "payout" ? currencySymbol(currency) : ICON[n.type];
            return (
              <li key={n.id}>
                <Link href={n.href} onClick={() => mark([n.id])} className={`sp-notif${n.urgent || !seen.has(n.id) ? " unread" : ""}${n.urgent ? " urgent" : ""}`}>
                  <span className="sp-notif-icon" aria-hidden style={icon.length > 1 ? { fontSize: 9 } : undefined}>{icon}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="sp-notif-title">{n.title}</span>
                    {n.body && <span className="sp-notif-body" style={{ whiteSpace: "normal" }}>{n.body}</span>}
                    <span className="sp-notif-at">{fmtDateTime(n.at)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
