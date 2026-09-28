"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, inr, fmtDate, type Order } from "../../lib/seller-api";
import { Alert, Badge, Button, Card, EmptyState, FullPageSpinner, PageHeader, RED } from "../../components/portal-ui";

// Mirrors ACCEPTABLE_ORDER_STATUSES in the backend: the only statuses a seller can act on
const ACTIONABLE = ["pending", "confirmed", "processing", "packed"];

type Filter = "action" | "all";

interface LabelState { waybill: string; url: string | null; pending: boolean }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("action");
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<Record<string, LabelState>>({});

  const load = useCallback(async () => {
    setError("");
    try { setOrders((await api.orders()).orders); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load orders"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const needsAction = (o: Order) => !o.multi_seller && ACTIONABLE.includes(o.status) && (!o.seller_accepted_at || !o.waybill);
  // Keep an order visible after its label is generated so the download link stays on screen
  const shown = useMemo(() => (orders ?? []).filter(o => filter === "all" || needsAction(o) || labels[o.ref_no]), [orders, filter, labels]);
  const actionCount = (orders ?? []).filter(needsAction).length;

  const run = async (refNo: string, fn: () => Promise<void>) => {
    setBusy(refNo);
    setRowError(e => ({ ...e, [refNo]: "" }));
    try { await fn(); }
    catch (err) { setRowError(e => ({ ...e, [refNo]: err instanceof Error ? err.message : "Something went wrong" })); }
    finally { setBusy(null); }
  };

  const accept = (refNo: string) => run(refNo, async () => {
    const { order } = await api.acceptOrder(refNo);
    setOrders(os => (os ?? []).map(o => o.ref_no === refNo ? order : o));
  });

  const label = (refNo: string) => run(refNo, async () => {
    const res = await api.orderLabel(refNo);
    setLabels(l => ({ ...l, [refNo]: { waybill: res.waybill, url: res.label_url, pending: res.label_pending } }));
    setOrders(os => (os ?? []).map(o => o.ref_no === refNo ? { ...o, waybill: res.waybill, courier_status: o.courier_status ?? "Shipment Created" } : o));
  });

  return (
    <div>
      <PageHeader title="Orders" sub="Accept new orders, then generate a Delhivery shipping label to hand over the package."
        action={<Button variant="secondary" onClick={() => { setOrders(null); void load(); }}>Refresh</Button>} />

      {error && <div style={{ marginBottom: 14 }}><Alert>{error}</Alert></div>}

      {!orders ? (!error && <FullPageSpinner />) : orders.length === 0 ? (
        <EmptyState title="No orders yet" sub="Orders for your products will show up here." />
      ) : (
        <>
          <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["action", "all"] as Filter[]).map(f => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} style={{
                padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: `1.5px solid ${filter === f ? "#111111" : "#E0E0E0"}`,
                background: filter === f ? "#111111" : "#FFFFFF", color: filter === f ? "#FFFFFF" : "#555555",
              }}>
                {f === "action" ? `Needs action (${actionCount})` : `All (${orders.length})`}
              </button>
            ))}
          </div>

          {shown.length === 0 && <p style={{ fontSize: 14, color: "#888888", padding: "20px 0" }}>You&apos;re all caught up.</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.map(o => {
              const lbl = labels[o.ref_no];
              const actionable = !o.multi_seller && ACTIONABLE.includes(o.status);
              return (
                <Card key={o.ref_no} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#111111" }}>{o.ref_no}</p>
                        <Badge status={o.status} />
                        {o.seller_accepted_at && <Badge status="approved" label="Accepted" />}
                        {o.payment_method && <span style={{ fontSize: 11, fontWeight: 700, color: "#888888", textTransform: "uppercase" }}>{o.payment_method}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: "#888888", marginTop: 3 }}>
                        {fmtDate(o.created_at)} · {o.customer_name ?? "Customer"}{o.city && `, ${o.city}`}{o.pincode && ` ${o.pincode}`}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#111111" }}>{inr(o.seller_subtotal)}</p>
                      {o.order_total !== null && o.order_total !== o.seller_subtotal && (
                        <p style={{ fontSize: 11, color: "#AAAAAA" }}>Order total {inr(o.order_total)}</p>
                      )}
                    </div>
                  </div>

                  <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {o.items.map((it, i) => (
                      <li key={`${it.product_id}-${it.size}-${i}`} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "#F3F3F3", flexShrink: 0 }}>
                          {it.product_image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.product_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <p style={{ flex: 1, fontSize: 13, color: "#333333" }}>
                          {it.product_name}
                          <span style={{ color: "#888888" }}>{it.size && ` · ${it.size}`} · Qty {it.quantity}</span>
                        </p>
                        <span style={{ fontSize: 13, color: "#555555" }}>{inr(it.line_total)}</span>
                      </li>
                    ))}
                  </ul>

                  {o.multi_seller && (
                    <p style={{ fontSize: 12, color: "#888888", marginTop: 12 }}>
                      This order includes items from other sellers — NOTMADE handles fulfilment.
                    </p>
                  )}

                  {(o.waybill || lbl) && (
                    <p style={{ fontSize: 13, color: "#333333", marginTop: 12 }}>
                      Waybill <strong>{lbl?.waybill ?? o.waybill}</strong>{o.courier_status && ` · ${o.courier_status}`}
                      {lbl?.url && <> · <a href={lbl.url} target="_blank" rel="noopener noreferrer" style={{ color: RED, fontWeight: 700 }}>Download label</a></>}
                      {lbl?.pending && <span style={{ color: "#B45309" }}> · Label is still being generated, try again in a minute.</span>}
                    </p>
                  )}

                  {rowError[o.ref_no] && <div style={{ marginTop: 12 }}><Alert>{rowError[o.ref_no]}</Alert></div>}

                  {actionable && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
                      {!o.seller_accepted_at ? (
                        <Button disabled={busy === o.ref_no} onClick={() => void accept(o.ref_no)}>
                          {busy === o.ref_no ? "Accepting…" : "Accept order"}
                        </Button>
                      ) : (
                        <Button variant={o.waybill ? "secondary" : "primary"} disabled={busy === o.ref_no} onClick={() => void label(o.ref_no)}>
                          {busy === o.ref_no ? "Generating…" : o.waybill ? "Get shipping label" : "Generate shipping label"}
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
