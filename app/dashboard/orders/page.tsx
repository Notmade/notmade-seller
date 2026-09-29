"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  api, inr, fmtDate, REJECT_REASONS,
  type Order, type RejectReason, type UnboxingVideo,
} from "../../lib/seller-api";
import { Alert, Badge, Button, Card, EmptyState, FullPageSpinner, Modal, PageHeader, RED, Spinner } from "../../components/portal-ui";

// Mirrors ACCEPTABLE_ORDER_STATUSES in the backend: the only statuses a seller can act on
const ACTIONABLE = ["pending", "confirmed", "processing", "packed"];
const SHIPPED = ["shipped", "dispatched", "in_transit", "out_for_delivery"];

type Tab = "new" | "accepted" | "rejected" | "shipped" | "delivered";
const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function tabOf(o: Order): Tab {
  if (o.seller_status === "rejected") return "rejected";
  if (o.status === "delivered") return "delivered";
  if (SHIPPED.includes(o.status)) return "shipped";
  if (o.seller_status === "accepted" || o.seller_accepted_at) return "accepted";
  return "new";
}

const VIDEO_LABEL: Record<string, string> = { pending_review: "Pending review", approved: "Approved", rejected: "Rejected" };

interface LabelState { waybill: string; url: string | null; pending: boolean }
type VideoState = { loading: true } | { loading: false; video: UnboxingVideo | null; error?: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("new");
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<Record<string, LabelState>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [videos, setVideos] = useState<Record<string, VideoState>>({});
  const [rejecting, setRejecting] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setError("");
    try { setOrders((await api.orders()).orders); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load orders"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { new: 0, accepted: 0, rejected: 0, shipped: 0, delivered: 0 };
    for (const o of orders ?? []) c[tabOf(o)]++;
    return c;
  }, [orders]);
  const shown = useMemo(() => (orders ?? []).filter(o => tabOf(o) === tab), [orders, tab]);

  const replaceOrder = (order: Order) => setOrders(os => (os ?? []).map(o => o.ref_no === order.ref_no ? order : o));

  const run = async (refNo: string, fn: () => Promise<void>) => {
    setBusy(refNo);
    setRowError(e => ({ ...e, [refNo]: "" }));
    try { await fn(); }
    catch (err) { setRowError(e => ({ ...e, [refNo]: err instanceof Error ? err.message : "Something went wrong" })); }
    finally { setBusy(null); }
  };

  const accept = (refNo: string) => run(refNo, async () => {
    replaceOrder((await api.acceptOrder(refNo)).order);
  });

  const label = (refNo: string) => run(refNo, async () => {
    const res = await api.orderLabel(refNo);
    setLabels(l => ({ ...l, [refNo]: { waybill: res.waybill, url: res.label_url, pending: res.label_pending } }));
    setOrders(os => (os ?? []).map(o => o.ref_no === refNo ? { ...o, waybill: res.waybill, courier_status: o.courier_status ?? "Shipment Created" } : o));
  });

  const loadVideo = async (refNo: string) => {
    setVideos(v => ({ ...v, [refNo]: { loading: true } }));
    try {
      const { video } = await api.unboxingVideo(refNo);
      setVideos(v => ({ ...v, [refNo]: { loading: false, video } }));
    } catch (err) {
      setVideos(v => ({ ...v, [refNo]: { loading: false, video: null, error: err instanceof Error ? err.message : "Could not load video" } }));
    }
  };

  const toggleDetails = (o: Order) => {
    const next = !open[o.ref_no];
    setOpen(s => ({ ...s, [o.ref_no]: next }));
    if (next && o.has_unboxing_video && !videos[o.ref_no]) void loadVideo(o.ref_no);
  };

  return (
    <div>
      <PageHeader title="Orders" sub="Accept or reject new orders, then generate a Delhivery shipping label to hand over the package."
        action={<Button variant="secondary" onClick={() => { setOrders(null); void load(); }}>Refresh</Button>} />

      {error && <div style={{ marginBottom: 14 }}><Alert>{error}</Alert></div>}

      {!orders ? (!error && <FullPageSpinner />) : orders.length === 0 ? (
        <EmptyState title="No orders yet" sub="Orders for your products will show up here." />
      ) : (
        <>
          <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} style={{
                padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: `1.5px solid ${tab === t.key ? "#111111" : "#E0E0E0"}`,
                background: tab === t.key ? "#111111" : "#FFFFFF", color: tab === t.key ? "#FFFFFF" : "#555555",
              }}>
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>

          {shown.length === 0 && (
            <p style={{ fontSize: 14, color: "#888888", padding: "20px 0" }}>
              {tab === "new" ? "You're all caught up." : "No orders here."}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.map(o => {
              const lbl = labels[o.ref_no];
              const canDecide = !o.multi_seller && o.seller_status === "awaiting" && ACTIONABLE.includes(o.status);
              const canLabel = !o.multi_seller && o.seller_status === "accepted" && ACTIONABLE.includes(o.status);
              const isBusy = busy === o.ref_no;
              const vid = videos[o.ref_no];
              return (
                <Card key={o.ref_no} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#111111" }}>{o.ref_no}</p>
                        <Badge status={o.status} />
                        {o.seller_status === "accepted" && <Badge status="accepted" label="Accepted" />}
                        {o.seller_status === "rejected" && <Badge status="rejected" label="Rejected" />}
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

                  {o.seller_status === "rejected" && (
                    <p style={{ fontSize: 13, color: "#333333", marginTop: 12 }}>
                      You rejected this order{o.seller_rejected_at && ` on ${fmtDate(o.seller_rejected_at)}`}
                      {o.seller_reject_reason && <> — <strong>{o.seller_reject_reason}</strong></>}. NOTMADE will follow up with the customer.
                    </p>
                  )}

                  {(o.waybill || lbl) && (
                    <p style={{ fontSize: 13, color: "#333333", marginTop: 12 }}>
                      Waybill <strong>{lbl?.waybill ?? o.waybill}</strong>{o.courier_status && ` · ${o.courier_status}`}
                      {lbl?.url && <> · <a href={lbl.url} target="_blank" rel="noopener noreferrer" style={{ color: RED, fontWeight: 700 }}>Download label</a></>}
                      {lbl?.pending && <span style={{ color: "#B45309" }}> · Label is still being generated, try again in a minute.</span>}
                    </p>
                  )}

                  {open[o.ref_no] && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F0F0F0" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Unboxing video</p>
                      {!o.has_unboxing_video ? (
                        <p style={{ fontSize: 13, color: "#888888" }}>The customer hasn&apos;t uploaded an unboxing video for this order.</p>
                      ) : !vid || vid.loading ? (
                        <Spinner size={22} />
                      ) : vid.error ? (
                        <Alert>{vid.error}</Alert>
                      ) : !vid.video ? (
                        <p style={{ fontSize: 13, color: "#888888" }}>No unboxing video for this order.</p>
                      ) : (
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                            <Badge status={vid.video.status} label={VIDEO_LABEL[vid.video.status] ?? vid.video.status} />
                            {vid.video.uploaded_at && <span style={{ fontSize: 12, color: "#888888" }}>Uploaded {fmtDate(vid.video.uploaded_at)}</span>}
                          </div>
                          {vid.video.url ? (
                            <video key={vid.video.url} src={vid.video.url} controls playsInline preload="metadata"
                              style={{ width: "100%", maxHeight: 420, borderRadius: 10, background: "#000000" }} />
                          ) : (
                            <p style={{ fontSize: 13, color: "#888888" }}>Video preview is unavailable. Contact NOTMADE support if you need it.</p>
                          )}
                          <p style={{ fontSize: 12, color: "#999999", marginTop: 6 }}>
                            View only — NOTMADE reviews unboxing videos. The link expires after a few minutes;{" "}
                            <button type="button" onClick={() => void loadVideo(o.ref_no)} style={{ background: "none", border: "none", padding: 0, color: RED, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>reload video</button>.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {rowError[o.ref_no] && <div style={{ marginTop: 12 }}><Alert>{rowError[o.ref_no]}</Alert></div>}

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
                    <Button variant="ghost" onClick={() => toggleDetails(o)}>
                      {open[o.ref_no] ? "Hide details" : "Details"}
                    </Button>
                    {canDecide && (
                      <>
                        <Button variant="danger" disabled={isBusy} onClick={() => setRejecting(o)}>Reject</Button>
                        <Button disabled={isBusy} onClick={() => void accept(o.ref_no)}>
                          {isBusy ? "Accepting…" : "Accept"}
                        </Button>
                      </>
                    )}
                    {canLabel && (
                      <Button variant={o.waybill ? "secondary" : "primary"} disabled={isBusy} onClick={() => void label(o.ref_no)}>
                        {isBusy ? "Generating…" : o.waybill ? "Get shipping label" : "Generate shipping label"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {rejecting && (
        <RejectModal
          order={rejecting}
          onClose={() => setRejecting(null)}
          onRejected={order => { replaceOrder(order); setRejecting(null); }}
        />
      )}
    </div>
  );
}

function RejectModal({ order, onClose, onRejected }: { order: Order; onClose: () => void; onRejected: (o: Order) => void }) {
  const [reason, setReason] = useState<RejectReason | "">("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsDetails = reason === "Other";
  const valid = !!reason && (!needsDetails || details.trim().length >= 3);

  const submit = async () => {
    if (!reason || !valid) return;
    setSaving(true);
    setError("");
    try { onRejected((await api.rejectOrder(order.ref_no, reason, details.trim() || undefined)).order); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not reject order"); setSaving(false); }
  };

  return (
    <Modal title={`Reject ${order.ref_no}?`} onClose={saving ? () => {} : onClose} width={460}>
      <p style={{ fontSize: 14, color: "#555555", marginBottom: 14 }}>
        Tell us why you can&apos;t fulfil this order. NOTMADE will decide what happens next with the customer.
      </p>
      <div role="radiogroup" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REJECT_REASONS.map(r => (
          <label key={r} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 14,
            border: `1.5px solid ${reason === r ? "#111111" : "#E5E5E5"}`, color: "#222222",
          }}>
            <input type="radio" name="reject-reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
            {r}
          </label>
        ))}
      </div>
      {reason && (
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={needsDetails ? "Describe the reason (required)" : "Add a note (optional)"}
          style={{ width: "100%", marginTop: 12, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E5E5", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
        />
      )}
      {error && <div style={{ marginTop: 12 }}><Alert>{error}</Alert></div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
        <Button variant="secondary" disabled={saving} onClick={onClose}>Cancel</Button>
        <Button disabled={!valid || saving} onClick={() => void submit()}>{saving ? "Rejecting…" : "Reject order"}</Button>
      </div>
    </Modal>
  );
}
