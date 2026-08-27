"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

const COMMISSION_RATE = 0.17;

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

interface OrderRow {
  id: string;
  order_id: string;
  status: string;
  price_inr: number;
  product_name: string;
  customer_name: string | null;
  quantity: number | null;
  size: string | null;
  seller_accepted_at: string | null;
  sla_deadline: string | null;
  ready_to_dispatch_at: string | null;
  dispatched_at: string | null;
  tracking_number: string | null;
  courier: string | null;
  cancel_reason: string | null;
  unboxing_video_status: string | null;
  created_at: string;
}

function getSlaStatus(slaDeadline: string | null): 'on_time' | 'at_risk' | 'breached' | null {
  if (!slaDeadline) return null;
  const msLeft = new Date(slaDeadline).getTime() - Date.now();
  if (msLeft < 0) return 'breached';
  if (msLeft < 12 * 60 * 60 * 1000) return 'at_risk';
  return 'on_time';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    pending:            { background: "#FFFBEB", color: "#B45309",  border: "1px solid #FDE68A" },
    confirmed:          { background: "#FFFBEB", color: "#B45309",  border: "1px solid #FDE68A" },
    seller_accepted:    { background: "#EFF6FF", color: "#1E40AF",  border: "1px solid #BFDBFE" },
    ready_to_dispatch:  { background: "#F5F3FF", color: "#6D28D9",  border: "1px solid #DDD6FE" },
    dispatched:         { background: "#F5F3FF", color: "#6D28D9",  border: "1px solid #DDD6FE" },
    delivered:          { background: "#F0FDF4", color: "#166534",  border: "1px solid #BBF7D0" },
    cancelled:          { background: "#FFF5F5", color: "#CC0000",  border: "1px solid #FECACA" },
  };
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, textTransform: "capitalize", ...(map[status] ?? { background: "#F5F5F5", color: "#555" }) }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function SlaBadge({ sla }: { sla: ReturnType<typeof getSlaStatus> }) {
  if (!sla) return null;
  const map = {
    on_time:  { bg: "#F0FDF4", color: "#166534", label: "SLA: On time" },
    at_risk:  { bg: "#FFFBEB", color: "#B45309", label: "SLA: At risk" },
    breached: { bg: "#FFF5F5", color: "#CC0000", label: "SLA: Breached" },
  };
  const s = map[sla];
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 100, background: s.bg, color: s.color, marginLeft: 6 }}>
      {s.label}
    </span>
  );
}

function VideoBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: "#FFFBEB", color: "#B45309", label: "Video: Pending" },
    uploaded:  { bg: "#EFF6FF", color: "#1E40AF", label: "Video: Uploaded" },
    approved:  { bg: "#F0FDF4", color: "#166534", label: "Video: Approved" },
    rejected:  { bg: "#FFF5F5", color: "#CC0000", label: "Video: Rejected" },
  };
  const s = map[status] ?? { bg: "#F5F5F5", color: "#555", label: `Video: ${status}` };
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 100, background: s.bg, color: s.color, marginLeft: 6 }}>
      {s.label}
    </span>
  );
}

type FilterTab = 'all' | 'pending' | 'seller_accepted' | 'ready_to_dispatch' | 'dispatched' | 'delivered';
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',               label: 'All' },
  { key: 'pending',           label: 'Pending' },
  { key: 'seller_accepted',   label: 'Accepted' },
  { key: 'ready_to_dispatch', label: 'Ready' },
  { key: 'dispatched',        label: 'Dispatched' },
  { key: 'delivered',         label: 'Delivered' },
];

interface TrackingModal {
  orderId: string;
  trackingNumber: string;
  courier: string;
}

interface CancelModal {
  orderId: string;
  reason: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders,        setOrders]        = useState<OrderRow[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [acting,        setActing]        = useState<string | null>(null);
  const [tab,           setTab]           = useState<FilterTab>('all');
  const [trackingModal, setTrackingModal] = useState<TrackingModal | null>(null);
  const [cancelModal,   setCancelModal]   = useState<CancelModal | null>(null);

  const sellerId = getSellerId();

  useEffect(() => {
    if (!sellerId) { clearToken(); router.replace("/login"); return; }
    void (async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, order_id, status, price_inr, product_name, customer_name, quantity, size, seller_accepted_at, sla_deadline, ready_to_dispatch_at, dispatched_at, tracking_number, courier, cancel_reason, unboxing_video_status, created_at')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });
        setOrders((data ?? []) as OrderRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, sellerId]);

  const doAccept = async (id: string) => {
    if (!sellerId) return;
    setActing(id + 'accept');
    const updates = { status: 'seller_accepted', seller_accepted_at: new Date().toISOString() };
    const { error } = await supabase.from('orders').update(updates).eq('id', id).eq('seller_id', sellerId);
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } as OrderRow : o));
    setActing(null);
  };

  const doReady = async (id: string) => {
    if (!sellerId) return;
    setActing(id + 'ready');
    const updates = { status: 'ready_to_dispatch', ready_to_dispatch_at: new Date().toISOString() };
    const { error } = await supabase.from('orders').update(updates).eq('id', id).eq('seller_id', sellerId);
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } as OrderRow : o));
    setActing(null);
  };

  const doDispatch = async () => {
    if (!trackingModal || !sellerId) return;
    setActing(trackingModal.orderId + 'dispatch');
    const updates = {
      status: 'dispatched',
      dispatched_at: new Date().toISOString(),
      tracking_number: trackingModal.trackingNumber.trim() || null,
      courier: trackingModal.courier.trim() || null,
    };
    const { error } = await supabase.from('orders').update(updates).eq('id', trackingModal.orderId).eq('seller_id', sellerId);
    if (!error) setOrders(prev => prev.map(o => o.id === trackingModal.orderId ? { ...o, ...updates } as OrderRow : o));
    setTrackingModal(null);
    setActing(null);
  };

  const doCancel = async () => {
    if (!cancelModal || !sellerId) return;
    if (!cancelModal.reason.trim()) return;
    setActing(cancelModal.orderId + 'cancel');
    const updates = { status: 'cancelled', cancel_reason: cancelModal.reason.trim() };
    const { error } = await supabase.from('orders').update(updates).eq('id', cancelModal.orderId).eq('seller_id', sellerId);
    if (!error) setOrders(prev => prev.map(o => o.id === cancelModal.orderId ? { ...o, ...updates } as OrderRow : o));
    setCancelModal(null);
    setActing(null);
  };

  const filtered = tab === 'all'
    ? orders
    : orders.filter(o => o.status === tab || (tab === 'pending' && o.status === 'confirmed'));

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Orders</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 500,
              cursor: "pointer",
              border: tab === t.key ? "1.5px solid #CC0000" : "1px solid #EEEEEE",
              background: tab === t.key ? "rgba(204,0,0,0.06)" : "#FFFFFF",
              color: tab === t.key ? "#CC0000" : "#555555",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "64px 24px", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", display: "block", color: "#CCCCCC" }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <p style={{ fontSize: 15, color: "#888888", fontWeight: 600 }}>
            No orders{tab !== 'all' ? ` in "${TABS.find(t => t.key === tab)?.label}"` : ""}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(o => {
            const sale       = Number(o.price_inr);
            const commission = sale * COMMISSION_RATE;
            const payout     = sale * (1 - COMMISSION_RATE);
            const sla        = getSlaStatus(o.sla_deadline);
            const canAccept  = o.status === 'pending' || o.status === 'confirmed';
            const canReady   = o.status === 'seller_accepted';
            const canDispatch = o.status === 'ready_to_dispatch';
            const canCancel  = ['pending', 'confirmed', 'seller_accepted', 'ready_to_dispatch'].includes(o.status);

            return (
              <div key={o.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>#{o.order_id}</span>
                      <StatusBadge status={o.status} />
                      <SlaBadge sla={sla} />
                      <VideoBadge status={o.unboxing_video_status} />
                    </div>
                    <p style={{ fontSize: 14, color: "#333333", marginBottom: 4 }}>{o.product_name}</p>
                    <p style={{ fontSize: 12, color: "#888888" }}>
                      {o.customer_name && `${o.customer_name} · `}
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {o.quantity && o.quantity > 1 && ` · Qty: ${o.quantity}`}
                      {o.size && ` · ${o.size}`}
                    </p>
                    {o.sla_deadline && o.status !== 'dispatched' && o.status !== 'delivered' && (
                      <p style={{ fontSize: 11, color: "#AAAAAA", marginTop: 4 }}>
                        Dispatch by: {new Date(o.sla_deadline).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    {o.tracking_number && (
                      <p style={{ fontSize: 11, color: "#6D28D9", marginTop: 4 }}>
                        Tracking: {o.courier ? `${o.courier} — ` : ""}{o.tracking_number}
                      </p>
                    )}
                    {o.cancel_reason && (
                      <p style={{ fontSize: 11, color: "#CC0000", marginTop: 4 }}>Cancel reason: {o.cancel_reason}</p>
                    )}
                  </div>

                  <div style={{ textAlign: "right", minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#888888" }}>Sale</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>{fmt(sale)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#888888" }}>Commission (17%)</span>
                      <span style={{ fontSize: 13, color: "#CC0000" }}>−{fmt(commission)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", paddingTop: 6, borderTop: "1px solid #EEEEEE" }}>
                      <span style={{ fontSize: 12, color: "#888888", fontWeight: 600 }}>Your Payout</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>{fmt(payout)}</span>
                    </div>
                  </div>
                </div>

                {(canAccept || canReady || canDispatch || canCancel) && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F5F5F5", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {canAccept && (
                      <button
                        onClick={() => doAccept(o.id)}
                        disabled={!!acting}
                        className="btn-primary"
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", border: "none", opacity: acting ? 0.6 : 1 }}
                      >
                        {acting === o.id + 'accept' ? "Accepting…" : "Accept Order"}
                      </button>
                    )}
                    {canReady && (
                      <button
                        onClick={() => doReady(o.id)}
                        disabled={!!acting}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", border: "1.5px solid #6D28D9", background: "transparent", color: "#6D28D9", opacity: acting ? 0.6 : 1 }}
                      >
                        {acting === o.id + 'ready' ? "Marking…" : "Mark Ready for Dispatch"}
                      </button>
                    )}
                    {canDispatch && (
                      <button
                        onClick={() => setTrackingModal({ orderId: o.id, trackingNumber: o.tracking_number ?? "", courier: o.courier ?? "" })}
                        disabled={!!acting}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", border: "1.5px solid #CC0000", background: "transparent", color: "#CC0000", opacity: acting ? 0.6 : 1 }}
                      >
                        Mark as Dispatched
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setCancelModal({ orderId: o.id, reason: "" })}
                        disabled={!!acting}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", border: "1px solid #EEEEEE", background: "transparent", color: "#888888", opacity: acting ? 0.6 : 1 }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking modal */}
      {trackingModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setTrackingModal(null); }}
        >
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "28px 24px", maxWidth: 440, width: "100%" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginBottom: 6 }}>Mark as Dispatched</h2>
            <p style={{ fontSize: 13, color: "#888888", marginBottom: 20 }}>Enter tracking details for this shipment.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Courier / Carrier</label>
                <input
                  type="text"
                  value={trackingModal.courier}
                  onChange={e => setTrackingModal(prev => prev ? { ...prev, courier: e.target.value } : null)}
                  placeholder="e.g. Delhivery, Bluedart, DTDC"
                  className="field-input"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Tracking Number</label>
                <input
                  type="text"
                  value={trackingModal.trackingNumber}
                  onChange={e => setTrackingModal(prev => prev ? { ...prev, trackingNumber: e.target.value } : null)}
                  placeholder="AWB / Tracking ID"
                  className="field-input"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={doDispatch}
                disabled={!!acting}
                className="btn-primary"
                style={{ flex: 1, padding: "11px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: acting ? "not-allowed" : "pointer", border: "none", opacity: acting ? 0.6 : 1 }}
              >
                {acting ? "Saving…" : "Confirm Dispatch →"}
              </button>
              <button
                onClick={() => setTrackingModal(null)}
                style={{ padding: "11px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid #EEEEEE", background: "transparent", color: "#888" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setCancelModal(null); }}
        >
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "28px 24px", maxWidth: 440, width: "100%" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111111", marginBottom: 6 }}>Cancel Order</h2>
            <p style={{ fontSize: 13, color: "#888888", marginBottom: 20 }}>Please provide a reason for cancellation.</p>

            <textarea
              value={cancelModal.reason}
              onChange={e => setCancelModal(prev => prev ? { ...prev, reason: e.target.value } : null)}
              rows={3}
              placeholder="e.g. Item out of stock, quality issue, unable to fulfil..."
              className="field-input resize-none"
              style={{ width: "100%", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={doCancel}
                disabled={!cancelModal.reason.trim() || !!acting}
                style={{ flex: 1, padding: "11px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: (!cancelModal.reason.trim() || !!acting) ? "not-allowed" : "pointer", border: "none", background: "#CC0000", color: "#FFF", opacity: (!cancelModal.reason.trim() || !!acting) ? 0.5 : 1 }}
              >
                {acting ? "Cancelling…" : "Confirm Cancellation"}
              </button>
              <button
                onClick={() => setCancelModal(null)}
                style={{ padding: "11px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid #EEEEEE", background: "transparent", color: "#888" }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
